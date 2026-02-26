import CompressPdfConfig from "../../components/config-panel/config-forms/CompressPdfConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const compressPdfEntry: NodeRegistryEntry = {
    id: "compress-pdf",
    label: "Compress PDF",
    description: "Rewrite and optimize PDF bytes",
    category: "transform",
    inputPorts: [{ id: "in", label: "PDF", direction: "input", dataType: "pdf" }],
    outputPorts: [{ id: "out", label: "PDF", direction: "output", dataType: "pdf" }],
    defaultConfig: { strategy: "rewrite" },
    executorId: "compress-pdf",
    supportsExecution: true,
    configForm: CompressPdfConfig,
}
