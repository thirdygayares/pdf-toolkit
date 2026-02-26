"use client"

import { Loader2, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFlowBuilder } from "../FlowBuilderContext"

export default function RunButton() {
    const { execution, flowState, batchFiles } = useFlowBuilder()

    if (execution.state.isRunning) {
        return (
            <Button type="button" variant="destructive" onClick={execution.cancel}>
                <Square className="size-4" />
                Cancel
            </Button>
        )
    }

    return (
        <Button
            type="button"
            onClick={() =>
                execution.runFlow({
                    flowName: flowState.flowName,
                    nodes: flowState.nodes,
                    edges: flowState.edges,
                    files: batchFiles.files,
                })
            }
            disabled={batchFiles.files.length === 0}
        >
            {execution.state.isRunning ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            Run Flow
        </Button>
    )
}
