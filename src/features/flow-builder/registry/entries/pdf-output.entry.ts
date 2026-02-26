import PdfOutputConfig from "../../components/config-panel/config-forms/PdfOutputConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const pdfOutputEntry: NodeRegistryEntry = {
    id: "pdf-output",
    label: "PDF Output",
    description: "Packages processed outputs for download",
    category: "io",
    inputPorts: [{ id: "in", label: "In", direction: "input", dataType: "any" }],
    outputPorts: [],
    defaultConfig: { archiveName: "flow-output", packageMode: "auto" },
    executorId: "pdf-output",
    supportsExecution: true,
    configForm: PdfOutputConfig,
}
