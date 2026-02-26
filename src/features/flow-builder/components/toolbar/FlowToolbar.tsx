"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFlowBuilder } from "../FlowBuilderContext"
import RunButton from "./RunButton"
import SaveLoadControls from "./SaveLoadControls"

export default function FlowToolbar() {
    const { flowState, batchFiles } = useFlowBuilder()

    return (
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background/90 px-3 backdrop-blur-sm">
            <Button asChild variant="ghost" size="sm">
                <Link href="/">
                    <ArrowLeft className="size-4" />
                    Back
                </Link>
            </Button>

            <div className="flex min-w-0 flex-1 items-center gap-3">
                <Input
                    value={flowState.flowName}
                    onChange={(event) => flowState.setFlowName(event.target.value)}
                    className="max-w-md"
                    aria-label="Flow name"
                />
                <Badge variant="secondary" className="hidden sm:inline-flex">
                    {batchFiles.files.length} file{batchFiles.files.length === 1 ? "" : "s"}
                </Badge>
            </div>

            <SaveLoadControls />
            <RunButton />
        </header>
    )
}
