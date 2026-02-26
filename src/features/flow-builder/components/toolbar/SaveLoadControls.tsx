"use client"

import { useRef } from "react"
import { Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFlowBuilder } from "../FlowBuilderContext"

export default function SaveLoadControls() {
    const { flowState, persistence } = useFlowBuilder()
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handleSaveLocal = () => {
        persistence.saveToLocalStorage(flowState.toDefinition())
    }

    const handleLoadLocal = () => {
        const definition = persistence.loadFromLocalStorage()
        if (!definition) return
        flowState.loadDefinition(definition)
    }

    return (
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleSaveLocal}>
                Save
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleLoadLocal}>
                Load
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => persistence.exportFlowJson(flowState.toDefinition())}>
                <Download className="size-4" />
                Export
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="size-4" />
                Import
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    const definition = await persistence.parseImportedFlowJson(file)
                    flowState.loadDefinition(definition)
                    event.currentTarget.value = ""
                }}
            />
        </div>
    )
}
