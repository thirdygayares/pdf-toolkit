"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useBatchFiles } from "../hooks/useBatchFiles"
import { useFlowExecution } from "../hooks/useFlowExecution"
import { useFlowPersistence } from "../hooks/useFlowPersistence"
import { useFlowState } from "../hooks/useFlowState"
import { useNodeConfig } from "../hooks/useNodeConfig"

export type FlowBuilderContextValue = {
    flowState: ReturnType<typeof useFlowState>
    batchFiles: ReturnType<typeof useBatchFiles>
    nodeConfig: ReturnType<typeof useNodeConfig>
    persistence: ReturnType<typeof useFlowPersistence>
    execution: ReturnType<typeof useFlowExecution>
}

const FlowBuilderContext = createContext<FlowBuilderContextValue | null>(null)

export function FlowBuilderProvider({ children }: { children: ReactNode }) {
    const flowState = useFlowState()
    const batchFiles = useBatchFiles()
    const persistence = useFlowPersistence()
    const execution = useFlowExecution()
    const nodeConfig = useNodeConfig({
        nodes: flowState.nodes,
        selectedNodeId: flowState.selectedNodeId,
        updateNodeConfig: flowState.updateNodeConfig,
    })

    return (
        <FlowBuilderContext.Provider
            value={{
                flowState,
                batchFiles,
                persistence,
                execution,
                nodeConfig,
            }}
        >
            {children}
        </FlowBuilderContext.Provider>
    )
}

export function useFlowBuilder() {
    const ctx = useContext(FlowBuilderContext)
    if (!ctx) {
        throw new Error("useFlowBuilder must be used within FlowBuilderProvider")
    }
    return ctx
}
