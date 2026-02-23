"use client";

import { useState } from "react";
import { Download, RotateCcw, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

type DialogWidthPreset = "normal" | "wide" | "full";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const STEP = 0.25;

const dialogWidthClass: Record<DialogWidthPreset, string> = {
    normal: "w-[min(96vw,920px)] max-w-[min(96vw,920px)] sm:max-w-none",
    wide: "w-[min(97vw,1200px)] max-w-[min(97vw,1200px)] sm:max-w-none",
    full: "w-[min(98vw,1480px)] max-w-[min(98vw,1480px)] sm:max-w-none",
};

export const ImagePreviewDialog = ({ item, open, onOpenChange, onDownload, onDelete }: Props) => {
    const [zoom, setZoom] = useState(1);
    const [widthPreset, setWidthPreset] = useState<DialogWidthPreset>("wide");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                key={item?.id ?? "empty"}
                className={cn("max-h-[94vh] p-0", dialogWidthClass[widthPreset])}
                showCloseButton
            >
                {item ? (
                    <>
                        <DialogHeader className="border-b px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4">
                            <DialogTitle className="truncate pr-8 text-xl">{item.name}</DialogTitle>
                            <DialogDescription className="truncate">
                                {item.sourceName} • Page {item.page} • {item.width}×{item.height}px
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:px-5">
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

                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/30 p-1">
                                    <span className="px-2 text-xs font-medium text-muted-foreground">Dialog width</span>
                                    <WidthPresetButton
                                        active={widthPreset === "normal"}
                                        onClick={() => setWidthPreset("normal")}
                                        label="Normal"
                                    />
                                    <WidthPresetButton active={widthPreset === "wide"} onClick={() => setWidthPreset("wide")} label="Wide" />
                                    <WidthPresetButton active={widthPreset === "full"} onClick={() => setWidthPreset("full")} label="Full" />
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
                        </div>

                        <div className="max-h-[calc(94vh-220px)] overflow-auto bg-muted/30 p-3 sm:p-4">
                            <div className="mx-auto flex min-h-[260px] items-center justify-center rounded-xl border bg-background p-3 shadow-sm sm:min-h-[320px]">
                                <div className="flex max-h-[calc(94vh-280px)] w-full items-center justify-center overflow-auto rounded-md border bg-muted/20 p-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.previewUrl}
                                        alt={item.name}
                                        className="block h-auto max-h-[calc(94vh-320px)] max-w-full rounded-md object-contain"
                                        style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};

type WidthPresetButtonProps = {
    active: boolean;
    label: string;
    onClick: () => void;
};

const WidthPresetButton = ({ active, label, onClick }: WidthPresetButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
        )}
        aria-pressed={active}
    >
        {label}
    </button>
);
