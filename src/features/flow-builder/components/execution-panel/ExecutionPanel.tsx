"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFlowBuilder } from "../FlowBuilderContext"
import BatchProgressList from "./BatchProgressList"
import ExecutionSummary from "./ExecutionSummary"

export default function ExecutionPanel() {
    const { execution } = useFlowBuilder()
    const [open, setOpen] = useState(true)

    return (
        <section className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 px-4 py-2">
                <div>
                    <h2 className="text-sm font-semibold">Execution</h2>
                    <p className="text-xs text-muted-foreground">
                        {execution.state.isRunning ? "Flow is running" : "Idle"}
                        {execution.state.error ? ` • ${execution.state.error}` : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={execution.resetExecution} disabled={execution.state.isRunning}>
                        <RotateCcw className="size-4" />
                        Clear
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setOpen((prev) => !prev)}>
                        {open ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                        {open ? "Collapse" : "Expand"}
                    </Button>
                </div>
            </div>
            {open ? (
                <div className="max-h-[34dvh] space-y-3 overflow-y-auto border-t border-border px-4 py-3">
                    <ExecutionSummary state={execution.state} />
                    <BatchProgressList items={execution.state.files} />
                </div>
            ) : null}
        </section>
    )
}
