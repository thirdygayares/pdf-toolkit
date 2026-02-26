import PdfInputConfig from "../../components/config-panel/config-forms/PdfInputConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const pdfInputEntry: NodeRegistryEntry = {
    id: "pdf-input",
    label: "PDF Input",
    description: "Batch source for uploaded PDF files",
    category: "io",
    inputPorts: [],
    outputPorts: [{ id: "out", label: "PDF", direction: "output", dataType: "pdf" }],
    defaultConfig: { inputKind: "pdf" },
    executorId: "pdf-input",
    supportsExecution: true,
    configForm: PdfInputConfig,
}
