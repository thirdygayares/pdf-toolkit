"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { NodeRegistryEntry } from "../../registry/node-registry"
import { NODE_DND_MIME } from "../canvas/FlowCanvas"

export default function NodePaletteItem({ entry }: { entry: NodeRegistryEntry }) {
    return (
        <button
            type="button"
            draggable
            onDragStart={(event) => {
                event.dataTransfer.setData(NODE_DND_MIME, entry.id)
                event.dataTransfer.effectAllowed = "move"
            }}
            className={cn(
                "w-full rounded-lg border border-border/70 bg-background p-3 text-left shadow-xs transition hover:border-primary/40 hover:bg-accent/40",
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{entry.label}</p>
                <Badge variant="outline" className="capitalize text-[10px]">
                    {entry.category}
                </Badge>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{entry.description}</p>
        </button>
    )
}
