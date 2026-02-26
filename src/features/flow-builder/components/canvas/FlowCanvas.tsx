"use client"

import { useCallback } from "react"
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    ReactFlowProvider,
    useReactFlow,
    type NodeTypes,
    type EdgeTypes,
} from "@xyflow/react"
import { useFlowBuilder } from "../FlowBuilderContext"
import type { NodeTypeId } from "../../types"
import CustomNode from "./CustomNode"
import CustomEdge from "./CustomEdge"

const nodeTypes: NodeTypes = {
    flowNode: CustomNode,
}

const edgeTypes: EdgeTypes = {
    flowEdge: CustomEdge,
}

const NODE_DND_MIME = "application/x-pdf-flow-node"

function FlowCanvasInner() {
    const { screenToFlowPosition } = useReactFlow()
    const { flowState } = useFlowBuilder()

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
    }, [])

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        const raw = event.dataTransfer.getData(NODE_DND_MIME)
        if (!raw) return
        const nodeTypeId = raw as NodeTypeId
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
        flowState.addNodeToCanvas(nodeTypeId, position)
    }, [flowState, screenToFlowPosition])

    return (
        <div className="h-full w-full surface-grid" onDragOver={handleDragOver} onDrop={handleDrop}>
            <ReactFlow
                nodes={flowState.nodes}
                edges={flowState.edges}
                onNodesChange={flowState.onNodesChange}
                onEdgesChange={flowState.onEdgesChange}
                onConnect={flowState.onConnect}
                onSelectionChange={flowState.onSelectionChange}
                onPaneClick={() => flowState.setSelectedNodeId(null)}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.2}
                maxZoom={1.6}
                proOptions={{ hideAttribution: true }}
                className="bg-transparent"
            >
                <MiniMap pannable zoomable className="!bg-background/90 !border !border-border" />
                <Controls className="!border !border-border !shadow-sm" />
                <Background gap={32} size={1} />
            </ReactFlow>
        </div>
    )
}

export default function FlowCanvas() {
    return (
        <ReactFlowProvider>
            <FlowCanvasInner />
        </ReactFlowProvider>
    )
}

export { NODE_DND_MIME }
