"use client"

import type { BatchExecutionState } from "../../types"

export default function ExecutionSummary({ state }: { state: BatchExecutionState }) {
    if (!state.summary) return null

    return (
        <div className="grid gap-3 rounded-lg border border-border/70 bg-background/70 p-3 sm:grid-cols-5">
            <Stat label="Total" value={state.summary.total} />
            <Stat label="Done" value={state.summary.completed} />
            <Stat label="Skipped" value={state.summary.skipped} />
            <Stat label="Failed" value={state.summary.failed} />
            <Stat label="Outputs" value={state.summary.outputCount} />
        </div>
    )
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold tabular-nums">{value}</p>
        </div>
    )
}
