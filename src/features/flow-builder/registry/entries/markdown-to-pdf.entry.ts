import MarkdownToPdfConfig from "../../components/config-panel/config-forms/MarkdownToPdfConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const markdownToPdfEntry: NodeRegistryEntry = {
    id: "markdown-to-pdf",
    label: "Markdown to PDF",
    description: "Render text/markdown to PDF (scaffolded)",
    category: "convert",
    inputPorts: [{ id: "in", label: "Text", direction: "input", dataType: "text" }],
    outputPorts: [{ id: "out", label: "PDF", direction: "output", dataType: "pdf" }],
    defaultConfig: { mode: "unsupported" },
    executorId: "markdown-to-pdf",
    supportsExecution: false,
    beta: true,
    configForm: MarkdownToPdfConfig,
}
