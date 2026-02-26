import ProtectPdfConfig from "../../components/config-panel/config-forms/ProtectPdfConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const protectPdfEntry: NodeRegistryEntry = {
    id: "protect-pdf",
    label: "Protect PDF",
    description: "Password-protect a PDF",
    category: "transform",
    inputPorts: [{ id: "in", label: "PDF", direction: "input", dataType: "pdf" }],
    outputPorts: [{ id: "out", label: "PDF", direction: "output", dataType: "pdf" }],
    defaultConfig: {
        userPassword: "",
        ownerPassword: "",
        printing: true,
        modifying: true,
        copying: true,
        annotating: true,
    },
    executorId: "protect-pdf",
    supportsExecution: true,
    configForm: ProtectPdfConfig,
}
