import type { PortDefinition } from "./data-bus"

export type NodeCategory = "io" | "transform" | "convert" | "helper"

export type NodeTypeId =
    | "pdf-input"
    | "pdf-output"
    | "split-pdf"
    | "merge-pdf"
    | "extract-text"
    | "pdf-to-image"
    | "image-to-pdf"
    | "markdown-to-pdf"
    | "compress-pdf"
    | "watermark-pdf"
    | "page-numbers-pdf"
    | "protect-pdf"
    | "filter"
    | "rename"

export interface NodeTypeDefinition {
    id: NodeTypeId
    label: string
    description: string
    category: NodeCategory
    inputPorts: PortDefinition[]
    outputPorts: PortDefinition[]
    defaultConfig: Record<string, unknown>
    executorId?: NodeTypeId
    supportsExecution?: boolean
    beta?: boolean
}
