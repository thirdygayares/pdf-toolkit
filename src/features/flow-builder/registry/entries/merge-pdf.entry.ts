import MergePdfConfig from "../../components/config-panel/config-forms/MergePdfConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const mergePdfEntry: NodeRegistryEntry = {
    id: "merge-pdf",
    label: "Merge PDF",
    description: "Merge multiple PDFs (scaffolded)",
    category: "transform",
    inputPorts: [{ id: "in", label: "PDF", direction: "input", dataType: "pdf" }],
    outputPorts: [{ id: "out", label: "PDF", direction: "output", dataType: "pdf" }],
    defaultConfig: { mode: "unsupported" },
    executorId: "merge-pdf",
    supportsExecution: false,
    beta: true,
    configForm: MergePdfConfig,
}
