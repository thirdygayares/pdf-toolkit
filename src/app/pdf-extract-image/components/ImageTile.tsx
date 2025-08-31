
"use client";

import { Download, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { imageUrl } from "../services/extract.service";

type Props = {
    name: string;
    page: number;
    selected: boolean;
    onToggle: () => void;
    onDownload: () => void;
};

export const ImageTile = ({ name, page, selected, onToggle, onDownload }: Props) => {
    return (
        <div
            className={cn(
                "group relative rounded-lg border overflow-hidden bg-background transition-all select-none",
                selected ? "ring-2 ring-primary border-primary/40" : "hover:border-primary/30"
            )}
        >
            <button
                type="button"
                onClick={onToggle}
                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-pressed={selected}
                aria-label={`Toggle image on page ${page}`}
            >
                <div className="relative">
                    <div className="w-full aspect-video bg-muted overflow-hidden">
                        {/* direct image streaming from backend */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl(name)} alt={name} className="w-full h-full object-contain" />
                    </div>

                    {/* selection badge */}
                    <div className="absolute top-2 left-2">
            <span
                className={cn(
                    "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold border",
                    selected ? "bg-primary text-primary-foreground border-transparent" : "bg-background/90"
                )}
            >
              <CheckCircle2 className={cn("h-3.5 w-3.5", selected ? "opacity-100" : "opacity-30")} />
              p.{page}
            </span>
                    </div>

                    {/* download icon (per-image, no zip) */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onDownload();
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 border rounded p-1"
                        title="Download image"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                </div>
                <div className="px-3 py-2 border-t text-[11px] truncate">{name}</div>
            </button>
        </div>
    );
};
