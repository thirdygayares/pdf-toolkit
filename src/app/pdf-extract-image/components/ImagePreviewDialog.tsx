"use client";

import { useState } from "react";
import { Download, RotateCcw, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { ExtractedItem } from "../hooks/useExtractImages";

type Props = {
    item: ExtractedItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDownload: (id: string) => void;
    onDelete: (id: string) => void;
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const STEP = 0.25;

export const ImagePreviewDialog = ({ item, open, onOpenChange, onDownload, onDelete }: Props) => {
    const [zoom, setZoom] = useState(1);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                key={item?.id ?? "empty"}
                className="max-h-[90vh] w-[min(96vw,1100px)] max-w-[min(96vw,1100px)] p-0"
                showCloseButton
            >
                {item ? (
                    <>
                        <DialogHeader className="border-b px-5 pt-5 pb-4">
                            <DialogTitle className="truncate pr-8">{item.name}</DialogTitle>
                            <DialogDescription>
                                {item.sourceName} • Page {item.page} • {item.width}×{item.height}px
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setZoom((value) => Math.max(MIN_ZOOM, Number((value - STEP).toFixed(2))))}
                                    disabled={zoom <= MIN_ZOOM}
                                >
                                    <ZoomOut className="mr-2 h-4 w-4" /> Zoom out
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setZoom((value) => Math.min(MAX_ZOOM, Number((value + STEP).toFixed(2))))}
                                    disabled={zoom >= MAX_ZOOM}
                                >
                                    <ZoomIn className="mr-2 h-4 w-4" /> Zoom in
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setZoom(1)}>
                                    <RotateCcw className="mr-2 h-4 w-4" /> Reset ({Math.round(zoom * 100)}%)
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => onDownload(item.id)}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        onDelete(item.id);
                                        onOpenChange(false);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-[calc(90vh-180px)] overflow-auto bg-muted/30 p-4">
                            <div className="mx-auto flex min-h-[320px] min-w-fit items-center justify-center rounded-xl border bg-background p-4 shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.previewUrl}
                                    alt={item.name}
                                    className="h-auto max-w-none rounded-md object-contain"
                                    style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                                />
                            </div>
                        </div>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};
