import FilterConfig from "../../components/config-panel/config-forms/FilterConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const filterEntry: NodeRegistryEntry = {
    id: "filter",
    label: "Filter",
    description: "Filter PDFs by metadata (page count)",
    category: "helper",
    inputPorts: [{ id: "in", label: "PDF", direction: "input", dataType: "pdf" }],
    outputPorts: [{ id: "out", label: "PDF", direction: "output", dataType: "pdf" }],
    defaultConfig: { minPages: 0, maxPages: 0 },
    executorId: "filter",
    supportsExecution: true,
    configForm: FilterConfig,
}
