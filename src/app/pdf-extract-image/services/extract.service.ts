// Client-side only helpers for the extract-images API
export const API_BASE = process.env.NEXT_PUBLIC_PDFTK_API ?? "http://localhost:8000";

export type ExtractImagesResponse = {
    document: string;
    total_pages: number;
    total_images: number;
    pages: { page: number; images: string[] }[];
};

export async function postExtractImages(opts: {
    file: File;
    dedupeByXref?: boolean;
    ttlSeconds?: number;
}): Promise<ExtractImagesResponse> {
    const { file, dedupeByXref = true, ttlSeconds = 1800 } = opts;

    // 20MB guard (backend will also guard, but fail-fast in UI)
    const MAX = 20 * 1024 * 1024;
    if (file.size > MAX) {
        throw new Error("File too large. Max 20MB allowed.");
    }

    const fd = new FormData();
    fd.append("file", file, file.name);

    const url = `${API_BASE}/extract/images/?dedupe_by_xref=${String(
        dedupeByXref
    )}&ttl_seconds=${ttlSeconds}`;

    const res = await fetch(url, {
        method: "POST",
        body: fd,
        headers: { accept: "application/json" },
        // Don't set Content-Type for FormData; the browser will.
    });

    if (!res.ok) {
        const msg = await safeText(res);
        throw new Error(msg || `Upload failed (${res.status})`);
    }
    return (await res.json()) as ExtractImagesResponse;
}

export function imageUrl(name: string): string {
    return `${API_BASE}/extract/images/${encodeURIComponent(name)}`;
}

export async function fetchImageBlob(name: string): Promise<Blob> {
    const res = await z(imagezUrl(name));
    if (!res.ok) throw new Error(`Failed to fetch ${name}`);
    return await res.blob();
}

async function safeText(res: Response) {
    try {
        return await res.text();
    } catch {
        return "";
    }
}
