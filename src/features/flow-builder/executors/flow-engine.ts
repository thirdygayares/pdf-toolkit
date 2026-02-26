import { getNodeRegistryEntry } from "../registry/node-registry"
import type { DataPacket, FlowCanvasEdge, FlowCanvasNode } from "../types"
import { validateFlow } from "../utils/flow-validator"
import type {
    ExecuteFlowBatchArgs,
    ExecuteFlowBatchResult,
    FlowEngineProgressEvent,
} from "./executor-types"
import { fileToPdfPacket } from "./node-executors/pdf-input.executor"
import { packageOutputPackets } from "./node-executors/pdf-output.executor"
import { nodeExecutors } from "./node-executors"

const topoSort = (nodes: FlowCanvasNode[], edges: FlowCanvasEdge[]) => {
    const inDegree = new Map<string, number>()
    const adjacency = new Map<string, string[]>()

    nodes.forEach((node) => {
        inDegree.set(node.id, 0)
        adjacency.set(node.id, [])
    })

    edges.forEach((edge) => {
        adjacency.get(edge.source)?.push(edge.target)
        inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
    })

    const queue = nodes.filter((node) => (inDegree.get(node.id) ?? 0) === 0).map((node) => node.id)
    const orderedIds: string[] = []

    while (queue.length > 0) {
        const id = queue.shift()
        if (!id) continue
        orderedIds.push(id)
        for (const next of adjacency.get(id) ?? []) {
            const nextDegree = (inDegree.get(next) ?? 0) - 1
            inDegree.set(next, nextDegree)
            if (nextDegree === 0) {
                queue.push(next)
            }
        }
    }

    if (orderedIds.length !== nodes.length) {
        throw new Error("Flow has a cycle. Remove circular connections and try again.")
    }

    return orderedIds
}

const emit = (onProgress: ExecuteFlowBatchArgs["onProgress"], event: FlowEngineProgressEvent) => {
    onProgress?.(event)
}

const abortError = (error: unknown) => error instanceof DOMException && error.name === "AbortError"

export const executeFlowBatch = async ({
    nodes,
    edges,
    files,
    flowName,
    concurrency = 3,
    signal,
    onProgress,
}: ExecuteFlowBatchArgs): Promise<ExecuteFlowBatchResult> => {
    const validation = validateFlow(nodes, edges)
    if (!validation.valid) {
        throw new Error(validation.errors[0] ?? "Invalid flow")
    }

    if (files.length === 0) {
        throw new Error("Upload at least one PDF in the PDF Input node before running the flow.")
    }

    const inputNode = nodes.find((node) => node.data.nodeTypeId === "pdf-input")
    const outputNode = nodes.find((node) => node.data.nodeTypeId === "pdf-output")

    if (!inputNode || !outputNode) {
        throw new Error("Flow must contain one PDF Input and one PDF Output node.")
    }

    const orderedIds = topoSort(nodes, edges)
    const nodeById = new Map(nodes.map((node) => [node.id, node]))
    const orderedNodes = orderedIds.map((id) => nodeById.get(id)).filter(Boolean) as FlowCanvasNode[]

    const startIndex = orderedNodes.findIndex((node) => node.id === inputNode.id)
    const endIndex = orderedNodes.findIndex((node) => node.id === outputNode.id)
    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
        throw new Error("PDF Output must appear downstream from PDF Input.")
    }

    const pipeline = orderedNodes.slice(startIndex + 1, endIndex)
    const outputs: Array<{ index: number; packet: DataPacket | null }> = new Array(files.length)
        .fill(null)
        .map((_, index) => ({ index, packet: null }))

    files.forEach((file) => {
        emit(onProgress, { type: "file", fileId: file.id, fileName: file.name, status: "queued", progress: 0 })
    })

    let cursor = 0

    const worker = async () => {
        while (cursor < files.length) {
            const current = cursor
            cursor += 1
            const item = files[current]
            if (!item) continue

            if (signal?.aborted) {
                emit(onProgress, { type: "file", fileId: item.id, fileName: item.name, status: "cancelled", progress: 0 })
                continue
            }

            try {
                let packet: DataPacket | null = await fileToPdfPacket({ id: item.id, file: item.file, index: current })
                emit(onProgress, { type: "file", fileId: item.id, fileName: item.name, status: "running", progress: 0.05, currentNodeId: inputNode.id, currentNodeLabel: inputNode.data.label })

                if (pipeline.length === 0) {
                    outputs[current] = { index: current, packet }
                    emit(onProgress, { type: "file", fileId: item.id, fileName: item.name, status: "done", progress: 1, currentNodeId: outputNode.id, currentNodeLabel: outputNode.data.label, output: packet })
                    continue
                }

                for (let index = 0; index < pipeline.length; index += 1) {
                    const node = pipeline[index]
                    const entry = getNodeRegistryEntry(node.data.nodeTypeId)
                    const executor = nodeExecutors[node.data.nodeTypeId]
                    const fractionStart = index / Math.max(1, pipeline.length)
                    emit(onProgress, {
                        type: "file",
                        fileId: item.id,
                        fileName: item.name,
                        status: "running",
                        progress: 0.1 + fractionStart * 0.8,
                        currentNodeId: node.id,
                        currentNodeLabel: entry.label,
                    })

                    if (!executor) {
                        throw new Error(`Missing executor for ${entry.label}`)
                    }

                    const nextPacket = await executor({
                        packet,
                        config: node.data.config,
                        ctx: {
                            signal,
                            fileId: item.id,
                            fileIndex: current,
                            fileName: item.name,
                            nodeId: node.id,
                            nodeTypeId: node.data.nodeTypeId,
                        },
                    })

                    if (nextPacket === null) {
                        outputs[current] = { index: current, packet: null }
                        emit(onProgress, {
                            type: "file",
                            fileId: item.id,
                            fileName: item.name,
                            status: "skipped",
                            progress: 1,
                            currentNodeId: node.id,
                            currentNodeLabel: entry.label,
                            output: null,
                        })
                        packet = null
                        break
                    }

                    packet = nextPacket
                }

                if (packet) {
                    outputs[current] = { index: current, packet }
                    emit(onProgress, {
                        type: "file",
                        fileId: item.id,
                        fileName: item.name,
                        status: "done",
                        progress: 1,
                        currentNodeId: outputNode.id,
                        currentNodeLabel: outputNode.data.label,
                        output: packet,
                    })
                }
            } catch (error) {
                if (abortError(error)) {
                    emit(onProgress, { type: "file", fileId: item.id, fileName: item.name, status: "cancelled", progress: 0 })
                    continue
                }
                const message = error instanceof Error ? error.message : "Flow execution failed"
                emit(onProgress, { type: "file", fileId: item.id, fileName: item.name, status: "error", progress: 1, error: message })
            }
        }
    }

    const workerCount = Math.max(1, Math.min(concurrency, files.length))
    await Promise.all(Array.from({ length: workerCount }, () => worker()))

    const finalPackets = outputs
        .sort((a, b) => a.index - b.index)
        .map((item) => item.packet)
        .filter((item): item is DataPacket => item !== null)

    const packaging = await packageOutputPackets({
        packets: finalPackets,
        config: outputNode.data.config,
        flowName,
    })

    return {
        outputs: finalPackets,
        outputArchiveName: packaging.fileName,
    }
}
