import WatermarkPdfConfig from "../../components/config-panel/config-forms/WatermarkPdfConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const watermarkPdfEntry: NodeRegistryEntry = {
    id: "watermark-pdf",
    label: "Watermark PDF",
    description: "Draw text watermark on every page",
    category: "transform",
    inputPorts: [{ id: "in", label: "PDF", direction: "input", dataType: "pdf" }],
    outputPorts: [{ id: "out", label: "PDF", direction: "output", dataType: "pdf" }],
    defaultConfig: { text: "CONFIDENTIAL", fontSize: 36, opacity: 0.2, color: "#888888", rotation: 45 },
    executorId: "watermark-pdf",
    supportsExecution: true,
    configForm: WatermarkPdfConfig,
}
