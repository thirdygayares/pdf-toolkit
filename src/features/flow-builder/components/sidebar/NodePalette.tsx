"use client"

import { nodeRegistryEntries } from "../../registry/node-registry"
import type { NodeCategory } from "../../types"
import NodePaletteItem from "./NodePaletteItem"

const categoryOrder: NodeCategory[] = ["io", "transform", "helper"]

export default function NodePalette() {
    return (
        <aside className="flex h-full min-h-0 w-60 flex-col overflow-hidden border-r border-border bg-background/80">
            <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">Node Palette</h2>
                <p className="mt-1 text-xs text-muted-foreground">Drag nodes onto the canvas.</p>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                {categoryOrder.map((category) => {
                    const entries = nodeRegistryEntries.filter((entry) => entry.category === category)
                    if (entries.length === 0) return null
                    return (
                        <section key={category} className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</h3>
                            <div className="space-y-2">
                                {entries.map((entry) => (
                                    <NodePaletteItem key={entry.id} entry={entry} />
                                ))}
                            </div>
                        </section>
                    )
                })}
            </div>
        </aside>
    )
}
