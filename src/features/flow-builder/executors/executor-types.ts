import type { FlowCanvasEdge, FlowCanvasNode, NodeTypeId } from "../types"
import type { DataPacket } from "../types"

export interface ExecutorRuntimeContext {
    signal?: AbortSignal
    fileIndex: number
    fileId: string
    fileName: string
    nodeId: string
    nodeTypeId: NodeTypeId
    reportProgress?: (progress: number, message?: string) => void
}

export interface NodeExecutionArgs {
    packet: DataPacket
    config: Record<string, unknown>
    ctx: ExecutorRuntimeContext
}

export type NodeExecutor = (args: NodeExecutionArgs) => Promise<DataPacket | null>

export interface PackageOutputsArgs {
    packets: DataPacket[]
    config: Record<string, unknown>
    flowName: string
}

export interface PackageOutputsResult {
    fileName?: string
    outputCount: number
}

export type OutputPackager = (args: PackageOutputsArgs) => Promise<PackageOutputsResult>

export interface FlowEngineProgressEvent {
    type: "file"
    fileId: string
    fileName: string
    status: "queued" | "running" | "done" | "error" | "skipped" | "cancelled"
    progress?: number
    currentNodeId?: string
    currentNodeLabel?: string
    error?: string
    output?: DataPacket | null
}

export interface ExecuteFlowBatchArgs {
    nodes: FlowCanvasNode[]
    edges: FlowCanvasEdge[]
    files: Array<{ id: string; name: string; file: File }>
    flowName: string
    concurrency?: number
    signal?: AbortSignal
    onProgress?: (event: FlowEngineProgressEvent) => void
}

export interface ExecuteFlowBatchResult {
    outputs: DataPacket[]
    outputArchiveName?: string
}
