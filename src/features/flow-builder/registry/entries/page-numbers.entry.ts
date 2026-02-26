import PageNumbersConfig from "../../components/config-panel/config-forms/PageNumbersConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const pageNumbersEntry: NodeRegistryEntry = {
    id: "page-numbers-pdf",
    label: "Page Numbers",
    description: "Add page numbers to every page",
    category: "transform",
    inputPorts: [{ id: "in", label: "PDF", direction: "input", dataType: "pdf" }],
    outputPorts: [{ id: "out", label: "PDF", direction: "output", dataType: "pdf" }],
    defaultConfig: { positionX: "center", positionY: "bottom", margin: 24, formatStyle: "n", fontSize: 12 },
    executorId: "page-numbers-pdf",
    supportsExecution: true,
    configForm: PageNumbersConfig,
}
