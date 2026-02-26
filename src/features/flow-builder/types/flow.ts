import type { Edge, Node, XYPosition } from "@xyflow/react"
import type { NodeCategory, NodeTypeId } from "./node-types"

export type FlowNodeData = {
    nodeTypeId: NodeTypeId
    label: string
    description: string
    category: NodeCategory
    config: Record<string, unknown>
}

export type FlowCanvasNode = Node<FlowNodeData, "flowNode">
export type FlowCanvasEdge = Edge<Record<string, unknown>, "flowEdge">

export interface FlowMeta {
    name: string
    version: number
    updatedAt: string
}

export interface SerializedFlowNode {
    id: string
    nodeTypeId: NodeTypeId
    position: XYPosition
    config: Record<string, unknown>
}

export interface SerializedFlowEdge {
    id: string
    source: string
    target: string
    sourceHandle?: string | null
    targetHandle?: string | null
}

export interface FlowDefinition {
    meta: FlowMeta
    nodes: SerializedFlowNode[]
    edges: SerializedFlowEdge[]
}
