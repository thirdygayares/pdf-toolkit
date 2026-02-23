"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import JSZipType from "jszip";
import { extractImagesLocally, type LocalExtractedImage } from "../services/extract.service";

export type ExtractedItem = LocalExtractedImage & {
    selected: boolean;
    previewUrl: string;
    sourceName: string;
    sourceIndex: number;
    downloadName: string;
    zipPath: string;
};

export type ExtractState = {
    busy: boolean;
    error: string | null;
    docs: string[];
    totalPages: number;
    items: ExtractedItem[];
    progressPage: number;
    progressTotalPages: number;
    progressFile: number;
    progressTotalFiles: number;
    progressFileName?: string;
};

export const useExtractImages = () => {
    const [state, setState] = useState<ExtractState>({
        busy: false,
        error: null,
        docs: [],
        totalPages: 0,
        items: [],
        progressPage: 0,
        progressTotalPages: 0,
        progressFile: 0,
        progressTotalFiles: 0,
        progressFileName: undefined,
    });
    const activeJobRef = useRef(0);
    const itemsRef = useRef<ExtractedItem[]>([]);

    const selectedCount = useMemo(() => state.items.filter((i) => i.selected).length, [state.items]);

    useEffect(() => {
        itemsRef.current = state.items;
    }, [state.items]);

    useEffect(() => {
        return () => {
            revokeItemUrls(itemsRef.current);
        };
    }, []);

    const extract = async (files: File[]) => {
        const validFiles = files.filter(Boolean);
        if (validFiles.length === 0) return;

        activeJobRef.current += 1;
        const jobId = activeJobRef.current;
        const docs = validFiles.map((file) => file.name);

        setState((current) => {
            revokeItemUrls(current.items);
            return {
                ...current,
                busy: true,
                error: null,
                docs,
                totalPages: 0,
                items: [],
                progressPage: 0,
                progressTotalPages: 0,
                progressFile: 0,
                progressTotalFiles: validFiles.length,
                progressFileName: validFiles[0]?.name,
            };
        });

        try {
            const allItems: ExtractedItem[] = [];
            let totalPages = 0;

            for (let fileIndex = 0; fileIndex < validFiles.length; fileIndex += 1) {
                if (jobId !== activeJobRef.current) return;

                const file = validFiles[fileIndex];
                const sourceFolder = `${String(fileIndex + 1).padStart(2, "0")}-${sanitizeSourceBase(file.name)}`;

                const data = await extractImagesLocally(file, {
                    dedupeXObjectRefs: true,
                    onProgress: ({ page, totalPages: fileTotalPages }) => {
                        if (jobId !== activeJobRef.current) return;
                        setState((current) => ({
                            ...current,
                            progressFile: fileIndex + 1,
                            progressTotalFiles: validFiles.length,
                            progressFileName: file.name,
                            progressPage: page,
                            progressTotalPages: fileTotalPages,
                        }));
                    },
                });

                if (jobId !== activeJobRef.current) return;

                totalPages += data.total_pages;

                const mapped = data.items.map<ExtractedItem>((item, itemIndex) => {
                    const sourcePrefix = `${sourceFolder}`;
                    return {
                        ...item,
                        id: `${fileIndex + 1}-${item.id}-${itemIndex + 1}`,
                        selected: true,
                        previewUrl: URL.createObjectURL(item.blob),
                        sourceName: file.name,
                        sourceIndex: fileIndex + 1,
                        downloadName: `${sourcePrefix}-${item.name}`,
                        zipPath: `${sourcePrefix}/${item.name}`,
                    };
                });

                allItems.push(...mapped);
            }

            if (jobId !== activeJobRef.current) return;

            setState((current) => ({
                ...current,
                busy: false,
                error: null,
                docs,
                totalPages,
                items: allItems,
                progressFile: validFiles.length,
                progressTotalFiles: validFiles.length,
                progressFileName: validFiles[validFiles.length - 1]?.name,
                progressPage: current.progressTotalPages,
                progressTotalPages: current.progressTotalPages,
            }));
        } catch (error) {
            if (jobId !== activeJobRef.current) return;

            const message = error instanceof Error ? error.message : "Extraction failed.";
            setState((current) => ({
                ...current,
                busy: false,
                error: message,
            }));
        }
    };

    const reset = () => {
        activeJobRef.current += 1;
        setState((current) => {
            revokeItemUrls(current.items);
            return {
                busy: false,
                error: null,
                docs: [],
                totalPages: 0,
                items: [],
                progressPage: 0,
                progressTotalPages: 0,
                progressFile: 0,
                progressTotalFiles: 0,
                progressFileName: undefined,
            };
        });
    };

    const toggle = (id: string) => {
        setState((current) => ({
            ...current,
            items: current.items.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it)),
        }));
    };

    const setAll = (value: boolean) => {
        setState((current) => ({
            ...current,
            items: current.items.map((it) => ({ ...it, selected: value })),
        }));
    };

    const invert = () => {
        setState((current) => ({
            ...current,
            items: current.items.map((it) => ({ ...it, selected: !it.selected })),
        }));
    };

    const remove = (id: string) => {
        setState((current) => {
            const target = current.items.find((it) => it.id === id);
            if (target) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return {
                ...current,
                items: current.items.filter((it) => it.id !== id),
            };
        });
    };

    const removeSelected = () => {
        setState((current) => {
            const selectedItems = current.items.filter((it) => it.selected);
            revokeItemUrls(selectedItems);
            return {
                ...current,
                items: current.items.filter((it) => !it.selected),
            };
        });
    };

    const downloadSingle = async (id: string) => {
        const item = state.items.find((it) => it.id === id);
        if (!item) return;
        triggerDownload(item.blob, item.downloadName);
    };

    const downloadAllZip = async () => {
        if (state.items.length === 0) return;
        await zipAndDownload(state.items, zipName("all", state.docs));
    };

    const downloadSelectedZip = async () => {
        const items = state.items.filter((it) => it.selected);
        if (items.length === 0) return;
        await zipAndDownload(items, zipName("selected", state.docs));
    };

    const progressPercent =
        state.busy && state.progressTotalFiles > 0
            ? Math.round(
                  (((Math.max(state.progressFile, 1) - 1) + pageProgressFraction(state.progressPage, state.progressTotalPages)) /
                      state.progressTotalFiles) *
                      100,
              )
            : 0;

    return {
        state,
        selectedCount,
        progressPercent,
        extract,
        reset,
        toggle,
        setAll,
        invert,
        remove,
        removeSelected,
        downloadSingle,
        downloadSelectedZip,
        downloadAllZip,
    };
};

function pageProgressFraction(page: number, totalPages: number) {
    if (totalPages <= 0) return 0;
    return Math.min(1, Math.max(0, page / totalPages));
}

function sanitizeSourceBase(name: string) {
    const base = name.replace(/\.pdf$/i, "").trim() || "document";
    const normalized = base.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    return normalized || "document";
}

function zipName(docsSuffix: "all" | "selected", docs: string[]) {
    const base = docs.length <= 1 ? sanitizeSourceBase(docs[0] ?? "document") : `${docs.length}-pdfs`;
    const ts = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
    return `${base}-images-${docsSuffix}-${ts}.zip`;
}

async function zipAndDownload(items: ExtractedItem[], zipFileName: string) {
    const { default: JSZip } = (await import("jszip")) as unknown as { default: typeof JSZipType };
    const zip = new JSZip();
    for (const item of items) {
        zip.file(item.zipPath, item.blob);
    }
    const out = await zip.generateAsync({ type: "blob" });
    triggerDownload(out, zipFileName);
}

const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
};

function revokeItemUrls(items: Pick<ExtractedItem, "previewUrl">[]) {
    for (const item of items) {
        URL.revokeObjectURL(item.previewUrl);
    }
}
