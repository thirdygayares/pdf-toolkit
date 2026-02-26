import type { DataPacket } from "./data-bus"

export type FileExecutionStatus = "queued" | "running" | "done" | "error" | "skipped" | "cancelled"

export interface BatchFileProgress {
    fileId: string
    fileName: string
    status: FileExecutionStatus
    progress: number
    currentNodeId?: string
    currentNodeLabel?: string
    error?: string
    output?: DataPacket | null
    startedAt?: number
    finishedAt?: number
}

export interface BatchExecutionSummary {
    total: number
    completed: number
    skipped: number
    failed: number
    cancelled: boolean
    outputCount: number
    archiveFileName?: string
}

export interface BatchExecutionState {
    isRunning: boolean
    startedAt?: number
    finishedAt?: number
    files: BatchFileProgress[]
    summary?: BatchExecutionSummary
    error?: string
}
