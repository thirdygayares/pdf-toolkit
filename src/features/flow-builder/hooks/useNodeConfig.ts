"use client"

import { useMemo } from "react"
import type { FlowCanvasNode } from "../types"

export function useNodeConfig({
    nodes,
    selectedNodeId,
    updateNodeConfig,
}: {
    nodes: FlowCanvasNode[]
    selectedNodeId: string | null
    updateNodeConfig: (nodeId: string, patch: Record<string, unknown>) => void
}) {
    const selectedNode = useMemo(
        () => (selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) ?? null : null),
        [nodes, selectedNodeId],
    )

    return {
        selectedNode,
        patchSelectedNodeConfig: (patch: Record<string, unknown>) => {
            if (!selectedNodeId) return
            updateNodeConfig(selectedNodeId, patch)
        },
    }
}
