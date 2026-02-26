import type { FlowCanvasEdge, FlowCanvasNode } from "../types"
import { getNodeRegistryEntry } from "../registry/node-registry"
import { isDataTypeCompatible } from "./data-type-compat"

export interface FlowValidationResult {
    valid: boolean
    errors: string[]
}

const getHandlePort = (node: FlowCanvasNode, handleId: string | null | undefined, direction: "input" | "output") => {
    const entry = getNodeRegistryEntry(node.data.nodeTypeId)
    const ports = direction === "input" ? entry.inputPorts : entry.outputPorts
    if (ports.length === 0) return null
    if (handleId) {
        const byId = ports.find((port) => port.id === handleId)
        if (byId) return byId
    }
    return ports[0] ?? null
}

export const validateFlow = (nodes: FlowCanvasNode[], edges: FlowCanvasEdge[]): FlowValidationResult => {
    const errors: string[] = []

    if (nodes.length === 0) {
        return { valid: false, errors: ["Add nodes to the canvas to build a flow."] }
    }

    const inputNodes = nodes.filter((node) => node.data.nodeTypeId === "pdf-input")
    const outputNodes = nodes.filter((node) => node.data.nodeTypeId === "pdf-output")

    if (inputNodes.length === 0) {
        errors.push("Flow requires a PDF Input node.")
    }
    if (outputNodes.length === 0) {
        errors.push("Flow requires a PDF Output node.")
    }

    const nodeById = new Map(nodes.map((node) => [node.id, node]))

    for (const edge of edges) {
        const source = nodeById.get(edge.source)
        const target = nodeById.get(edge.target)
        if (!source || !target) {
            errors.push(`Edge ${edge.id} references a missing node.`)
            continue
        }
        const sourcePort = getHandlePort(source, edge.sourceHandle ?? null, "output")
        const targetPort = getHandlePort(target, edge.targetHandle ?? null, "input")
        if (!sourcePort || !targetPort) continue
        if (!isDataTypeCompatible(sourcePort.dataType, targetPort.dataType)) {
            errors.push(
                `Type mismatch: ${source.data.label} (${sourcePort.dataType}) -> ${target.data.label} (${targetPort.dataType}).`,
            )
        }
    }

    for (const node of nodes) {
        const entry = getNodeRegistryEntry(node.data.nodeTypeId)
        const incoming = edges.filter((edge) => edge.target === node.id).length
        const outgoing = edges.filter((edge) => edge.source === node.id).length

        if (entry.inputPorts.length > 0 && incoming === 0) {
            errors.push(`${entry.label} is missing an input connection.`)
        }
        if (entry.outputPorts.length > 0 && outgoing === 0) {
            errors.push(`${entry.label} is missing an output connection.`)
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}
