"use client"

import type { BatchFileProgress } from "../../types"
import BatchProgressItem from "./BatchProgressItem"

export default function BatchProgressList({ items }: { items: BatchFileProgress[] }) {
    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground">Run the flow to see per-file execution progress.</p>
    }

    return (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
                <BatchProgressItem key={item.fileId} item={item} />
            ))}
        </div>
    )
}
