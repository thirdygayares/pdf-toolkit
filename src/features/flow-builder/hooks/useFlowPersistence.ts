"use client"

import { useCallback } from "react"
import type { FlowDefinition } from "../types"

const STORAGE_KEY = "pdf-flow-builder:last-flow"

export function useFlowPersistence() {
    const saveToLocalStorage = useCallback((definition: FlowDefinition) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(definition))
    }, [])

    const loadFromLocalStorage = useCallback((): FlowDefinition | null => {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        try {
            return JSON.parse(raw) as FlowDefinition
        } catch {
            return null
        }
    }, [])

    const exportFlowJson = useCallback((definition: FlowDefinition) => {
        const blob = new Blob([JSON.stringify(definition, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = `${definition.meta.name || "pdf-flow"}.json`
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
    }, [])

    const parseImportedFlowJson = useCallback(async (file: File): Promise<FlowDefinition> => {
        const text = await file.text()
        return JSON.parse(text) as FlowDefinition
    }, [])

    return {
        saveToLocalStorage,
        loadFromLocalStorage,
        exportFlowJson,
        parseImportedFlowJson,
    }
}
