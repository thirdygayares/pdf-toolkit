"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Position, type NodeProps } from "@xyflow/react"
import { getNodeRegistryEntry } from "../../registry/node-registry"
import type { FlowCanvasNode } from "../../types"
import { NodeHandle } from "./NodeHandle"

const categoryTone: Record<string, string> = {
    io: "bg-blue-500/10 text-blue-700 border-blue-200",
    transform: "bg-orange-500/10 text-orange-700 border-orange-200",
    convert: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    helper: "bg-violet-500/10 text-violet-700 border-violet-200",
}

export default function CustomNode({ data, selected }: NodeProps<FlowCanvasNode>) {
    const entry = getNodeRegistryEntry(data.nodeTypeId)
    const hasIn = entry.inputPorts.length > 0
    const hasOut = entry.outputPorts.length > 0

    return (
        <div
            className={cn(
                "relative min-w-[220px] rounded-xl border bg-card p-3 shadow-sm transition-shadow",
                selected ? "border-primary shadow-md ring-2 ring-primary/15" : "border-border/80",
            )}
        >
            {hasIn &&
                entry.inputPorts.map((port, index) => (
                    <NodeHandle
                        key={`in-${port.id}`}
                        id={port.id}
                        type="target"
                        position={Position.Left}
                        dataType={port.dataType}
                        style={{ top: 24 + index * 18 }}
                    />
                ))}

            {hasOut &&
                entry.outputPorts.map((port, index) => (
                    <NodeHandle
                        key={`out-${port.id}`}
                        id={port.id}
                        type="source"
                        position={Position.Right}
                        dataType={port.dataType}
                        style={{ top: 24 + index * 18 }}
                    />
                ))}

            <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-sm font-semibold leading-tight text-foreground">{entry.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{entry.description}</p>
                    </div>
                    <Badge variant="outline" className={cn("capitalize", categoryTone[entry.category])}>
                        {entry.category}
                    </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                    {entry.supportsExecution ? (
                        <Badge variant="secondary" className="text-[10px]">Runnable</Badge>
                    ) : (
                        <Badge variant="secondary" className="text-[10px]">Scaffolded</Badge>
                    )}
                    {entry.beta ? <Badge variant="secondary" className="text-[10px]">Beta</Badge> : null}
                </div>
            </div>
        </div>
    )
}
