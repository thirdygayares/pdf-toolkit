import SplitPdfConfig from "../../components/config-panel/config-forms/SplitPdfConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const splitPdfEntry: NodeRegistryEntry = {
    id: "split-pdf",
    label: "Split PDF",
    description: "Select a subset of pages",
    category: "transform",
    inputPorts: [{ id: "in", label: "PDF", direction: "input", dataType: "pdf" }],
    outputPorts: [{ id: "out", label: "PDF", direction: "output", dataType: "pdf" }],
    defaultConfig: { mode: "all", pageRange: "" },
    executorId: "split-pdf",
    supportsExecution: true,
    configForm: SplitPdfConfig,
}
