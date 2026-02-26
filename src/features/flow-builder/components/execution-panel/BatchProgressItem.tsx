"use client"

import { cn } from "@/lib/utils"
import type { BatchFileProgress } from "../../types"

const toneByStatus: Record<BatchFileProgress["status"], string> = {
    queued: "text-muted-foreground",
    running: "text-primary",
    done: "text-emerald-700",
    error: "text-destructive",
    skipped: "text-amber-700",
    cancelled: "text-muted-foreground",
}

export default function BatchProgressItem({ item }: { item: BatchFileProgress }) {
    const percent = Math.max(0, Math.min(100, Math.round((item.progress || 0) * 100)))

    return (
        <div className="rounded-lg border border-border/70 bg-background/70 p-3">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.fileName}</p>
                    <p className={cn("truncate text-xs", toneByStatus[item.status])}>
                        {item.status}
                        {item.currentNodeLabel ? ` • ${item.currentNodeLabel}` : ""}
                        {item.error ? ` • ${item.error}` : ""}
                    </p>
                </div>
                <span className="text-xs font-medium tabular-nums text-muted-foreground">{percent}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${percent}%` }} />
            </div>
        </div>
    )
}
