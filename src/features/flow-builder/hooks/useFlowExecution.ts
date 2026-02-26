"use client"

import { useCallback, useRef, useState } from "react"
import type { UploadedFile } from "@/hooks/useFileUpload"
import type { BatchExecutionState, BatchFileProgress, FlowCanvasEdge, FlowCanvasNode } from "../types"
import { executeFlowBatch } from "../executors/flow-engine"

const emptyState: BatchExecutionState = {
    isRunning: false,
    files: [],
}

export function useFlowExecution() {
    const [state, setState] = useState<BatchExecutionState>(emptyState)
    const abortRef = useRef<AbortController | null>(null)

    const cancel = useCallback(() => {
        abortRef.current?.abort()
    }, [])

    const runFlow = useCallback(async ({
        flowName,
        nodes,
        edges,
        files,
    }: {
        flowName: string
        nodes: FlowCanvasNode[]
        edges: FlowCanvasEdge[]
        files: UploadedFile[]
    }) => {
        const initialFiles: BatchFileProgress[] = files.map((file) => ({
            fileId: file.id,
            fileName: file.name,
            status: "queued",
            progress: 0,
        }))

        const byId = new Map(initialFiles.map((item) => [item.fileId, item]))
        const controller = new AbortController()
        abortRef.current = controller

        setState({
            isRunning: true,
            startedAt: Date.now(),
            files: initialFiles,
            summary: undefined,
            error: undefined,
        })

        try {
            const result = await executeFlowBatch({
                flowName,
                nodes,
                edges,
                files: files.map((file) => ({ id: file.id, name: file.name, file: file.file })),
                signal: controller.signal,
                onProgress: (event) => {
                    if (event.type !== "file") return
                    const current = byId.get(event.fileId)
                    const next: BatchFileProgress = {
                        ...(current ?? {
                            fileId: event.fileId,
                            fileName: event.fileName,
                            status: "queued",
                            progress: 0,
                        }),
                        fileName: event.fileName,
                        status: event.status,
                        progress: typeof event.progress === "number" ? event.progress : current?.progress ?? 0,
                        currentNodeId: event.currentNodeId,
                        currentNodeLabel: event.currentNodeLabel,
                        error: event.error,
                        output: event.output,
                        startedAt:
                            event.status === "running"
                                ? (current?.startedAt ?? Date.now())
                                : current?.startedAt,
                        finishedAt:
                            event.status === "done" || event.status === "error" || event.status === "skipped" || event.status === "cancelled"
                                ? Date.now()
                                : current?.finishedAt,
                    }
                    byId.set(event.fileId, next)
                    setState((prev) => ({
                        ...prev,
                        files: prev.files.map((item) => (item.fileId === event.fileId ? next : item)),
                    }))
                },
            })

            const fileList = Array.from(byId.values())
            const completed = fileList.filter((item) => item.status === "done").length
            const skipped = fileList.filter((item) => item.status === "skipped").length
            const failed = fileList.filter((item) => item.status === "error").length
            const cancelled = controller.signal.aborted

            setState((prev) => ({
                ...prev,
                isRunning: false,
                finishedAt: Date.now(),
                summary: {
                    total: fileList.length,
                    completed,
                    skipped,
                    failed,
                    cancelled,
                    outputCount: result.outputs.length,
                    archiveFileName: result.outputArchiveName,
                },
            }))
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to run flow"
            setState((prev) => ({
                ...prev,
                isRunning: false,
                finishedAt: Date.now(),
                error: message,
                summary: {
                    total: files.length,
                    completed: prev.files.filter((item) => item.status === "done").length,
                    skipped: prev.files.filter((item) => item.status === "skipped").length,
                    failed: Math.max(1, prev.files.filter((item) => item.status === "error").length),
                    cancelled: controller.signal.aborted,
                    outputCount: 0,
                },
            }))
        } finally {
            abortRef.current = null
        }
    }, [])

    const resetExecution = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort()
            abortRef.current = null
        }
        setState(emptyState)
    }, [])

    return {
        state,
        runFlow,
        cancel,
        resetExecution,
    }
}
