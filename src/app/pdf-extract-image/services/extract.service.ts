"use client";

import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist/types/src/display/api";

export type LocalExtractedImage = {
    id: string;
    name: string;
    page: number;
    blob: Blob;
    width: number;
    height: number;
    bytes: number;
};

export type LocalExtractImagesResponse = {
    document: string;
    total_pages: number;
    total_images: number;
    pages: { page: number; images: string[] }[];
    items: LocalExtractedImage[];
};

type PdfModule = typeof import("pdfjs-dist/build/pdf");
type PdfModuleWithInternals = PdfModule & {
    OPS?: Record<string, number>;
    ImageKind?: {
        GRAYSCALE_1BPP: number;
        RGB_24BPP: number;
        RGBA_32BPP: number;
    };
};

type ImageDataLike = {
    width: number;
    height: number;
    data?: Uint8Array | Uint8ClampedArray;
    kind?: number;
    bitmap?: ImageBitmap;
};

type ExtractProgress = {
    page: number;
    totalPages: number;
};

type PdfObjectStore = {
    has: (objId: string) => boolean;
    get: (objId: string, callback?: (data: unknown) => void) => unknown;
};

let cachedPdfModule: PdfModuleWithInternals | null = null;

const DEFAULT_MAX_SIZE_BYTES = 100 * 1024 * 1024;

export async function extractImagesLocally(
    file: File,
    opts?: {
        maxSizeBytes?: number;
        dedupeXObjectRefs?: boolean;
        onProgress?: (progress: ExtractProgress) => void;
    },
): Promise<LocalExtractImagesResponse> {
    const maxSizeBytes = opts?.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
    if (file.size > maxSizeBytes) {
        throw new Error(`File is too large. Max ${Math.round(maxSizeBytes / (1024 * 1024))}MB.`);
    }

    const pdfModule = await loadPdfModule();
    const bytes = await file.arrayBuffer();
    const loadingTask = pdfModule.getDocument({ data: bytes });
    const doc = await loadingTask.promise;

    try {
        return await extractFromDocument(doc, file.name, pdfModule, opts);
    } finally {
        try {
            await doc.destroy();
        } catch {
            // no-op
        }
    }
}

async function extractFromDocument(
    doc: PDFDocumentProxy,
    filename: string,
    pdfModule: PdfModuleWithInternals,
    opts?: {
        dedupeXObjectRefs?: boolean;
        onProgress?: (progress: ExtractProgress) => void;
    },
): Promise<LocalExtractImagesResponse> {
    const totalPages = doc.numPages;
    const allItems: LocalExtractedImage[] = [];
    const pages: { page: number; images: string[] }[] = [];
    const seenXObjectKeys = new Set<string>();
    let counter = 0;

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        opts?.onProgress?.({ page: pageNumber, totalPages });
        const page = await doc.getPage(pageNumber);
        const pageItems = await extractPageImages(page, pageNumber, pdfModule, {
            dedupeXObjectRefs: opts?.dedupeXObjectRefs ?? true,
            seenXObjectKeys,
            nextIndex: () => {
                counter += 1;
                return counter;
            },
        });

        pages.push({ page: pageNumber, images: pageItems.map((item) => item.name) });
        allItems.push(...pageItems);

        try {
            page.cleanup();
        } catch {
            // no-op
        }
    }

    return {
        document: filename,
        total_pages: totalPages,
        total_images: allItems.length,
        pages,
        items: allItems,
    };
}

async function extractPageImages(
    page: PDFPageProxy,
    pageNumber: number,
    pdfModule: PdfModuleWithInternals,
    ctx: {
        dedupeXObjectRefs: boolean;
        seenXObjectKeys: Set<string>;
        nextIndex: () => number;
    },
): Promise<LocalExtractedImage[]> {
    const ops = pdfModule.OPS ?? {};
    const operatorList = await page.getOperatorList();
    const results: LocalExtractedImage[] = [];
    const pageInlineSeen = new Set<string>();
    const pageXObjectSeen = new Set<string>();

    for (let index = 0; index < operatorList.fnArray.length; index += 1) {
        const fn = operatorList.fnArray[index];
        const args = operatorList.argsArray[index];

        if (
            fn === ops.paintImageXObject ||
            fn === ops.paintImageXObjectRepeat
        ) {
            const objId = Array.isArray(args) ? String(args[0]) : "";
            if (!objId) continue;

            const pageKey = `${pageNumber}:${objId}`;
            if (pageXObjectSeen.has(pageKey)) {
                continue;
            }
            pageXObjectSeen.add(pageKey);

            const dedupeKey = `xobj:${objId}`;
            if (ctx.dedupeXObjectRefs && ctx.seenXObjectKeys.has(dedupeKey)) {
                continue;
            }

            const raw = await waitForObject(page.objs, objId).catch(async () => {
                return await waitForObject(page.commonObjs, objId);
            });
            const converted = await convertPdfImageToBlob(raw, pdfModule);
            if (!converted) continue;

            if (ctx.dedupeXObjectRefs) {
                ctx.seenXObjectKeys.add(dedupeKey);
            }

            const imageIndex = ctx.nextIndex();
            results.push(
                buildLocalImage({
                    blob: converted.blob,
                    width: converted.width,
                    height: converted.height,
                    page: pageNumber,
                    index: imageIndex,
                    prefix: "image",
                }),
            );
            continue;
        }

        if (
            fn === ops.paintInlineImageXObject ||
            fn === ops.paintInlineImageXObjectGroup
        ) {
            const inlineData = Array.isArray(args) ? (args[0] as ImageDataLike | undefined) : undefined;
            if (!inlineData) continue;

            const signature = buildInlineSignature(pageNumber, inlineData);
            if (pageInlineSeen.has(signature)) {
                continue;
            }
            pageInlineSeen.add(signature);

            const converted = await convertPdfImageToBlob(inlineData, pdfModule);
            if (!converted) continue;

            const imageIndex = ctx.nextIndex();
            results.push(
                buildLocalImage({
                    blob: converted.blob,
                    width: converted.width,
                    height: converted.height,
                    page: pageNumber,
                    index: imageIndex,
                    prefix: "inline",
                }),
            );
        }
    }

    return results;
}

function buildLocalImage(opts: {
    blob: Blob;
    width: number;
    height: number;
    page: number;
    index: number;
    prefix: string;
}): LocalExtractedImage {
    const pagePart = String(opts.page).padStart(2, "0");
    const indexPart = String(opts.index).padStart(4, "0");
    const extension = blobExtension(opts.blob.type);

    return {
        id: `${opts.page}-${opts.prefix}-${indexPart}`,
        name: `page-${pagePart}-${opts.prefix}-${indexPart}.${extension}`,
        page: opts.page,
        blob: opts.blob,
        width: opts.width,
        height: opts.height,
        bytes: opts.blob.size,
    };
}

function blobExtension(mime: string) {
    if (mime === "image/jpeg") return "jpg";
    if (mime === "image/webp") return "webp";
    return "png";
}

async function loadPdfModule(): Promise<PdfModuleWithInternals> {
    if (cachedPdfModule) {
        return cachedPdfModule;
    }

    const pdfJsModule = (await import("pdfjs-dist/build/pdf")) as PdfModuleWithInternals;
    pdfJsModule.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    cachedPdfModule = pdfJsModule;
    return pdfJsModule;
}

async function waitForObject(objs: PdfObjectStore, objId: string): Promise<unknown> {
    try {
        if (objs.has(objId)) {
            return objs.get(objId);
        }
    } catch {
        // fall through to callback-based get
    }

    return await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            reject(new Error(`Timed out waiting for PDF object: ${objId}`));
        }, 3000);

        try {
            objs.get(objId, (data: unknown) => {
                window.clearTimeout(timeout);
                resolve(data);
            });
        } catch (error) {
            window.clearTimeout(timeout);
            reject(error);
        }
    });
}

async function convertPdfImageToBlob(raw: unknown, pdfModule: PdfModuleWithInternals): Promise<{
    blob: Blob;
    width: number;
    height: number;
} | null> {
    if (!raw) {
        return null;
    }

    if (typeof ImageBitmap !== "undefined" && raw instanceof ImageBitmap) {
        const blob = await canvasBlobFromDrawable(raw, raw.width, raw.height);
        return { blob, width: raw.width, height: raw.height };
    }

    if (typeof ImageData !== "undefined" && raw instanceof ImageData) {
        const blob = await canvasBlobFromImageData(raw);
        return { blob, width: raw.width, height: raw.height };
    }

    if (isCanvasImageSource(raw)) {
        const dims = imageSourceSize(raw);
        const blob = await canvasBlobFromDrawable(raw, dims.width, dims.height);
        return { blob, width: dims.width, height: dims.height };
    }

    if (typeof raw === "object" && raw !== null) {
        const maybe = raw as ImageDataLike;

        if (maybe.bitmap && typeof ImageBitmap !== "undefined" && maybe.bitmap instanceof ImageBitmap) {
            const blob = await canvasBlobFromDrawable(maybe.bitmap, maybe.bitmap.width, maybe.bitmap.height);
            return { blob, width: maybe.bitmap.width, height: maybe.bitmap.height };
        }

        if (typeof maybe.width === "number" && typeof maybe.height === "number" && maybe.data) {
            const rgba = toRgbaBytes(maybe, pdfModule);
            const imageData = new ImageData(new Uint8ClampedArray(rgba), maybe.width, maybe.height);
            const blob = await canvasBlobFromImageData(imageData);
            return { blob, width: maybe.width, height: maybe.height };
        }
    }

    return null;
}

function toRgbaBytes(source: ImageDataLike, pdfModule: PdfModuleWithInternals): Uint8ClampedArray {
    const width = Math.max(1, Math.floor(source.width));
    const height = Math.max(1, Math.floor(source.height));
    const data = source.data ?? new Uint8Array();
    const pixelCount = width * height;
    const rgba = new Uint8ClampedArray(pixelCount * 4);
    const kinds = pdfModule.ImageKind;
    const rgbaKind = kinds?.RGBA_32BPP ?? 3;
    const rgbKind = kinds?.RGB_24BPP ?? 2;
    const gray1Kind = kinds?.GRAYSCALE_1BPP ?? 1;

    if (source.kind === rgbaKind) {
        rgba.set(data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength));
        return rgba;
    }

    if (source.kind === rgbKind || source.kind == null) {
        for (let i = 0, p = 0; p < pixelCount; p += 1) {
            rgba[p * 4] = data[i++] ?? 0;
            rgba[p * 4 + 1] = data[i++] ?? 0;
            rgba[p * 4 + 2] = data[i++] ?? 0;
            rgba[p * 4 + 3] = 255;
        }
        return rgba;
    }

    if (source.kind === gray1Kind) {
        for (let p = 0; p < pixelCount; p += 1) {
            const byte = data[p >> 3] ?? 0;
            const bit = 7 - (p & 7);
            const on = (byte >> bit) & 1;
            const value = on ? 0 : 255;
            rgba[p * 4] = value;
            rgba[p * 4 + 1] = value;
            rgba[p * 4 + 2] = value;
            rgba[p * 4 + 3] = 255;
        }
        return rgba;
    }

    for (let i = 0, p = 0; p < pixelCount; p += 1) {
        rgba[p * 4] = data[i++] ?? 0;
        rgba[p * 4 + 1] = data[i++] ?? 0;
        rgba[p * 4 + 2] = data[i++] ?? 0;
        rgba[p * 4 + 3] = 255;
    }

    return rgba;
}

async function canvasBlobFromImageData(imageData: ImageData): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Unable to initialize canvas context.");
    }
    context.putImageData(imageData, 0, 0);
    return await canvasToBlob(canvas, "image/png");
}

async function canvasBlobFromDrawable(source: CanvasImageSource, width: number, height: number): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(width));
    canvas.height = Math.max(1, Math.floor(height));
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Unable to initialize canvas context.");
    }

    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    return await canvasToBlob(canvas, "image/png");
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Failed to generate image output."));
                return;
            }
            resolve(blob);
        }, mimeType);
    });
}

function isCanvasImageSource(value: unknown): value is CanvasImageSource {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    if (typeof HTMLCanvasElement !== "undefined" && value instanceof HTMLCanvasElement) return true;
    if (typeof HTMLImageElement !== "undefined" && value instanceof HTMLImageElement) return true;
    if (typeof SVGImageElement !== "undefined" && value instanceof SVGImageElement) return true;
    if (typeof ImageBitmap !== "undefined" && value instanceof ImageBitmap) return true;
    if (typeof OffscreenCanvas !== "undefined" && value instanceof OffscreenCanvas) return true;
    if (typeof HTMLVideoElement !== "undefined" && value instanceof HTMLVideoElement) return true;

    return false;
}

function imageSourceSize(source: CanvasImageSource): { width: number; height: number } {
    if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) {
        return { width: source.naturalWidth || source.width, height: source.naturalHeight || source.height };
    }
    if (typeof HTMLCanvasElement !== "undefined" && source instanceof HTMLCanvasElement) {
        return { width: source.width, height: source.height };
    }
    if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
        return { width: source.width, height: source.height };
    }
    if (typeof OffscreenCanvas !== "undefined" && source instanceof OffscreenCanvas) {
        return { width: source.width, height: source.height };
    }
    if (typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement) {
        return { width: source.videoWidth || source.width, height: source.videoHeight || source.height };
    }
    return { width: 1, height: 1 };
}

function buildInlineSignature(pageNumber: number, inlineData: ImageDataLike): string {
    const data = inlineData.data;
    let checksum = 0;

    if (data && data.length > 0) {
        const sample = Math.min(data.length, 128);
        for (let i = 0; i < sample; i += 1) {
            checksum = (checksum + data[i] * (i + 1)) % 1_000_000_007;
        }
    }

    return [
        pageNumber,
        inlineData.width,
        inlineData.height,
        inlineData.kind ?? "unknown",
        data?.length ?? 0,
        checksum,
    ].join(":");
}
