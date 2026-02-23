"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Download, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
    id: string;
    src: string;
    name: string;
    sourceName?: string;
    page: number;
    selected: boolean;
    width: number;
    height: number;
    sizeLabel: string;
    onToggle: () => void;
    onPreview: () => void;
    onDownload: () => void;
    onDelete: () => void;
};

export const ImageTile = ({
    src,
    name,
    sourceName,
    page,
    selected,
    width,
    height,
    sizeLabel,
    onToggle,
    onPreview,
    onDownload,
    onDelete,
}: Props) => {
    return (
        <article
            className={cn(
                "group relative overflow-hidden rounded-xl border bg-card transition-shadow",
                selected ? "border-primary/40 ring-2 ring-primary/20 shadow-sm" : "border-border/80 hover:shadow-sm",
            )}
        >
            <div className="relative border-b bg-gradient-to-b from-muted/60 to-muted/30">
                <button
                    type="button"
                    onClick={onPreview}
                    className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`Preview ${name}`}
                >
                    <div className="aspect-[4/3] w-full p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={name} className="h-full w-full rounded-md object-contain" loading="lazy" />
                    </div>
                </button>

                <div className="absolute top-2 left-2">
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-pressed={selected}
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium shadow-sm backdrop-blur",
                            selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/80 bg-background/90 text-foreground hover:bg-background",
                        )}
                    >
                        <CheckCircle2 className={cn("h-3.5 w-3.5", selected ? "opacity-100" : "opacity-40")} />
                        P{page}
                    </button>
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    <IconAction label="Preview image" onClick={onPreview}>
                        <Eye className="h-4 w-4" />
                    </IconAction>
                    <IconAction label="Download image" onClick={onDownload}>
                        <Download className="h-4 w-4" />
                    </IconAction>
                    <IconAction label="Delete image" onClick={onDelete} danger>
                        <Trash2 className="h-4 w-4" />
                    </IconAction>
                </div>
            </div>

            <div className="space-y-2 p-3">
                <div>
                    <p className="truncate text-sm font-medium text-foreground" title={name}>
                        {name}
                    </p>
                    {sourceName ? (
                        <p className="truncate text-xs text-muted-foreground" title={sourceName}>
                            {sourceName}
                        </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                        {width}×{height}px • {sizeLabel}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <Button type="button" variant={selected ? "default" : "outline"} size="sm" className="h-8 px-3" onClick={onToggle}>
                        {selected ? "Selected" : "Select"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-3" onClick={onPreview}>
                        Zoom
                    </Button>
                </div>
            </div>
        </article>
    );
};

type IconActionProps = {
    children: ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
};

const IconAction = ({ children, label, onClick, danger = false }: IconActionProps) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background/90 shadow-sm backdrop-blur",
            danger ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-accent",
        )}
        aria-label={label}
        title={label}
    >
        {children}
    </button>
);
