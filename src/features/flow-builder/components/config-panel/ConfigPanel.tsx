"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useFlowBuilder } from "../FlowBuilderContext"
import { getNodeRegistryEntry } from "../../registry/node-registry"

export default function ConfigPanel() {
    const { nodeConfig, batchFiles, flowState } = useFlowBuilder()
    const selected = nodeConfig.selectedNode

    if (!selected) {
        return (
            <aside className="flex h-full min-h-0 w-80 flex-col overflow-hidden border-l border-border bg-background/80">
                <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold">Config</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Select a node to edit settings.</p>
                </div>
                <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-center">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">No node selected</p>
                        <p className="text-xs text-muted-foreground">Click a node in the canvas to configure it.</p>
                    </div>
                </div>
            </aside>
        )
    }

    const entry = getNodeRegistryEntry(selected.data.nodeTypeId)
    const Form = entry.configForm

    return (
        <aside className="flex h-full min-h-0 w-80 flex-col overflow-hidden border-l border-border bg-background/80">
            <div className="border-b border-border px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h2 className="text-sm font-semibold">{entry.label}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">{entry.description}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{entry.category}</Badge>
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <Form
                    nodeId={selected.id}
                    config={selected.data.config}
                    onPatch={nodeConfig.patchSelectedNodeConfig}
                    runtime={{
                        batchFiles: batchFiles.files,
                        addBatchFiles: batchFiles.addBatchFiles,
                        removeBatchFile: batchFiles.removeBatchFile,
                        clearBatchFiles: batchFiles.clearBatchFiles,
                    }}
                />
            </div>
            <div className="border-t border-border p-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => flowState.removeNode(selected.id)}>
                    Remove Node
                </Button>
            </div>
        </aside>
    )
}
