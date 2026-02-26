"use client"

import { useCallback, useMemo, useState } from "react"
import {
    addEdge,
    MarkerType,
    type Connection,
    type OnConnect,
    type XYPosition,
    useEdgesState,
    useNodesState,
} from "@xyflow/react"
import { getNodeRegistryEntry } from "../registry/node-registry"
import type { FlowCanvasEdge, FlowCanvasNode, FlowDefinition, NodeTypeId } from "../types"
import { isDataTypeCompatible } from "../utils/data-type-compat"
import { generateId } from "../utils/generate-id"
import { deserializeFlow, serializeFlow } from "../utils/flow-serializer"

const makeNode = (nodeTypeId: NodeTypeId, position: XYPosition): FlowCanvasNode => {
    const entry = getNodeRegistryEntry(nodeTypeId)

    return {
        id: generateId("node"),
        type: "flowNode",
        position,
        data: {
            nodeTypeId,
            label: entry.label,
            description: entry.description,
            category: entry.category,
            config: structuredClone(entry.defaultConfig),
        },
    }
}

const makeInitialNodes = (): FlowCanvasNode[] => [
    makeNode("pdf-input", { x: 64, y: 180 }),
    makeNode("compress-pdf", { x: 360, y: 180 }),
    makeNode("pdf-output", { x: 656, y: 180 }),
]

const makeInitialEdges = (nodes: FlowCanvasNode[]): FlowCanvasEdge[] => {
    const input = nodes[0]
    const compress = nodes[1]
    const output = nodes[2]
    if (!input || !compress || !output) return []

    return [
        {
            id: generateId("edge"),
            type: "flowEdge",
            source: input.id,
            target: compress.id,
            sourceHandle: "out",
            targetHandle: "in",
            markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
            id: generateId("edge"),
            type: "flowEdge",
            source: compress.id,
            target: output.id,
            sourceHandle: "out",
            targetHandle: "in",
            markerEnd: { type: MarkerType.ArrowClosed },
        },
    ]
}

const getPortDataType = (node: FlowCanvasNode, handleId: string | null | undefined, direction: "input" | "output") => {
    const entry = getNodeRegistryEntry(node.data.nodeTypeId)
    const ports = direction === "input" ? entry.inputPorts : entry.outputPorts
    if (ports.length === 0) return null
    return ports.find((port) => port.id === handleId) ?? ports[0] ?? null
}

export function useFlowState() {
    const initialNodes = useMemo(() => makeInitialNodes(), [])
    const initialEdges = useMemo(() => makeInitialEdges(initialNodes), [initialNodes])
    const [nodes, setNodes, onNodesChange] = useNodesState<FlowCanvasNode>(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState<FlowCanvasEdge>(initialEdges)
    const [flowName, setFlowName] = useState("My PDF Flow")
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

    const addNodeToCanvas = useCallback((nodeTypeId: NodeTypeId, position: XYPosition) => {
        const next = makeNode(nodeTypeId, position)
        setNodes((prev) => [...prev, next])
        setSelectedNodeId(next.id)
        return next.id
    }, [setNodes])

    const removeNode = useCallback((nodeId: string) => {
        setNodes((prev) => prev.filter((node) => node.id !== nodeId))
        setEdges((prev) => prev.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
        setSelectedNodeId((prev) => (prev === nodeId ? null : prev))
    }, [setEdges, setNodes])

    const updateNodeConfig = useCallback((nodeId: string, patch: Record<string, unknown>) => {
        setNodes((prev) =>
            prev.map((node) =>
                node.id === nodeId
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            config: {
                                ...node.data.config,
                                ...patch,
                            },
                        },
                    }
                    : node,
            ),
        )
    }, [setNodes])

    const onConnect: OnConnect = useCallback((connection: Connection) => {
        if (!connection.source || !connection.target) return
        if (connection.source === connection.target) return

        const sourceNode = nodes.find((node) => node.id === connection.source)
        const targetNode = nodes.find((node) => node.id === connection.target)
        if (!sourceNode || !targetNode) return

        const sourcePort = getPortDataType(sourceNode, connection.sourceHandle, "output")
        const targetPort = getPortDataType(targetNode, connection.targetHandle, "input")
        if (!sourcePort || !targetPort) return
        if (!isDataTypeCompatible(sourcePort.dataType, targetPort.dataType)) return

        setEdges((prev) => {
            const filtered = prev.filter(
                (edge) => !(edge.target === connection.target && edge.targetHandle === (connection.targetHandle ?? null)),
            )
            return addEdge(
                {
                    ...connection,
                    id: generateId("edge"),
                    type: "flowEdge",
                    markerEnd: { type: MarkerType.ArrowClosed },
                },
                filtered,
            ) as FlowCanvasEdge[]
        })
    }, [nodes, setEdges])

    const onSelectionChange = useCallback((selection: { nodes?: FlowCanvasNode[] }) => {
        const node = selection.nodes?.[0]
        setSelectedNodeId(node?.id ?? null)
    }, [])

    const clearFlow = useCallback(() => {
        const resetNodes = makeInitialNodes()
        setNodes(resetNodes)
        setEdges(makeInitialEdges(resetNodes))
        setSelectedNodeId(null)
        setFlowName("My PDF Flow")
    }, [setEdges, setNodes])

    const toDefinition = useCallback(() => serializeFlow({ name: flowName, nodes, edges }), [edges, flowName, nodes])

    const loadDefinition = useCallback((definition: FlowDefinition) => {
        const flow = deserializeFlow(definition)
        const nextNodes: FlowCanvasNode[] = flow.nodes.map((node) => {
            const entry = getNodeRegistryEntry(node.nodeTypeId)
            return {
                id: node.id,
                type: "flowNode",
                position: node.position,
                data: {
                    nodeTypeId: node.nodeTypeId,
                    label: entry.label,
                    description: entry.description,
                    category: entry.category,
                    config: {
                        ...entry.defaultConfig,
                        ...node.config,
                    },
                },
            }
        })
        const nextEdges: FlowCanvasEdge[] = flow.edges.map((edge) => ({
            id: edge.id,
            type: "flowEdge",
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            markerEnd: { type: MarkerType.ArrowClosed },
        }))

        setFlowName(flow.meta.name || "My PDF Flow")
        setNodes(nextNodes)
        setEdges(nextEdges)
        setSelectedNodeId(null)
    }, [setEdges, setNodes])

    return {
        flowName,
        setFlowName,
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onSelectionChange,
        addNodeToCanvas,
        removeNode,
        updateNodeConfig,
        selectedNodeId,
        setSelectedNodeId,
        clearFlow,
        toDefinition,
        loadDefinition,
    }
}
