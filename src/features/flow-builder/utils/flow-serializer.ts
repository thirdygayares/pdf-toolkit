import type { FlowCanvasEdge, FlowCanvasNode, FlowDefinition } from "../types"

export const serializeFlow = ({
    name,
    nodes,
    edges,
}: {
    name: string
    nodes: FlowCanvasNode[]
    edges: FlowCanvasEdge[]
}): FlowDefinition => ({
    meta: {
        name,
        version: 1,
        updatedAt: new Date().toISOString(),
    },
    nodes: nodes.map((node) => ({
        id: node.id,
        nodeTypeId: node.data.nodeTypeId,
        position: node.position,
        config: node.data.config,
    })),
    edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
    })),
})

export const deserializeFlow = (definition: FlowDefinition) => definition
