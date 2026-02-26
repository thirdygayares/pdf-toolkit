import RenameConfig from "../../components/config-panel/config-forms/RenameConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const renameEntry: NodeRegistryEntry = {
    id: "rename",
    label: "Rename",
    description: "Rename output files with tokens",
    category: "helper",
    inputPorts: [{ id: "in", label: "In", direction: "input", dataType: "any" }],
    outputPorts: [{ id: "out", label: "Out", direction: "output", dataType: "any" }],
    defaultConfig: { pattern: "{name}-processed" },
    executorId: "rename",
    supportsExecution: true,
    configForm: RenameConfig,
}
