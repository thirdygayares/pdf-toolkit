"use client";

import { useMemo, useState } from "react";
import JSZipType from "jszip";
import { fetchImageBlob, imageUrl, postExtractImages, ExtractImagesResponse } from "../services/extract.service";

export type ExtractedItem = {
    name: string;
    page: number;
    selected: boolean;
};

export type ExtractState = {
    busy: boolean;
    error: string | null;
    doc?: string;
    totalPages: number;
    items: ExtractedItem[];
    dedupeByXref: boolean;
};

export const useExtractImages = () =>{
    const [state, setState] = useState<ExtractState>({
        busy: false,
        error: null,
        doc: undefined,
        totalPages: 0,
        items: [],
        dedupeByXref: false,
    });

    const selectedCount = useMemo(() => state.items.filter(i => i.selected).length, [state.items]);

    const extract = async (file: File) => {
        setState(s => ({ ...s, busy: true, error: null, items: [], doc: undefined, totalPages: 0 }));
        try {
            const data = await postExtractImages({
                file,
                dedupeByXref: state.dedupeByXref,
                ttlSeconds: 1800,
            });
            const items = flattenToItems(data);
            // default: all selected
            items.forEach(i => (i.selected = true));
            setState(s => ({
                ...s,
                busy: false,
                error: null,
                doc: data.document,
                totalPages: data.total_pages,
                items,
            }));
        } catch (e: any) {
            setState(s => ({ ...s, busy: false, error: e?.message || "Extraction failed." }));
        }
    }

    const reset = () => {
        setState({
            busy: false,
            error: null,
            doc: undefined,
            totalPages: 0,
            items: [],
            dedupeByXref: true,
        });
    }

    const toggle = (name: string)=> {
        setState(s => ({
            ...s,
            items: s.items.map(it => (it.name === name ? { ...it, selected: !it.selected } : it)),
        }));
    }

    const setAll = (v: boolean) => {
        setState(s => ({ ...s, items: s.items.map(it => ({ ...it, selected: v })) }));
    }

    const invert = () => {
        setState(s => ({ ...s, items: s.items.map(it => ({ ...it, selected: !it.selected })) }));
    }

    const setDedupe= (v: boolean) =>{
        setState(s => ({ ...s, dedupeByXref: v }));
    }

    const downloadSingle = async (name: string) => {
        const blob = await fetchImageBlob(name);
        triggerDownload(blob, name);
    }

    const downloadAllZip = async () => {
        const names = state.items.map(i => i.name);
        await zipAndDownload(names, zipName("all"));
    }

    const downloadSelectedZip =async ()=> {
        const names = state.items.filter(i => i.selected).map(i => i.name);
        if (names.length === 0) return;
        await zipAndDownload(names, zipName("selected"));
    }

    const zipName = (suffix: "all" | "selected") =>{
        const base = state.doc?.replace(/\.pdf$/i, "") || "document";
        const ts = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
        return `${base} images ${suffix} ${ts}.zip`;
    }

    async function zipAndDownload(names: string[], zipFileName: string) {
        const { default: JSZip } = (await import("jszip")) as unknown as { default: typeof JSZipType };
        const zip = new JSZip();
        const blobs = await Promise.all(names.map(n => fetchImageBlob(n)));
        blobs.forEach((b, idx) => zip.file(names[idx], b));
        const out = await zip.generateAsync({ type: "blob" });
        triggerDownload(out, zipFileName);
    }

    return {
        state,
        selectedCount,
        extract,
        reset,
        toggle,
        setAll,
        invert,
        setDedupe,
        downloadSingle,
        downloadSelectedZip,
        downloadAllZip,
    };
}

const flattenToItems = (res: ExtractImagesResponse): ExtractedItem[] => {
    const out: ExtractedItem[] = [];
    for (const p of res.pages) {
        for (const name of p.images) {
            out.push({ name, page: p.page, selected: false });
        }
    }
    return out;
}

const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
