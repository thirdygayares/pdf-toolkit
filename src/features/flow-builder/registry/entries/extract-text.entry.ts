import ExtractTextConfig from "../../components/config-panel/config-forms/ExtractTextConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const extractTextEntry: NodeRegistryEntry = {
    id: "extract-text",
    label: "Extract Text",
    description: "Extract plain text from a PDF",
    category: "convert",
    inputPorts: [{ id: "in", label: "PDF", direction: "input", dataType: "pdf" }],
    outputPorts: [{ id: "out", label: "Text", direction: "output", dataType: "text" }],
    defaultConfig: { trim: true },
    executorId: "extract-text",
    supportsExecution: true,
    configForm: ExtractTextConfig,
}
