import PdfToImageConfig from "../../components/config-panel/config-forms/PdfToImageConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const pdfToImageEntry: NodeRegistryEntry = {
    id: "pdf-to-image",
    label: "PDF to Image",
    description: "Convert PDF pages to images (scaffolded)",
    category: "convert",
    inputPorts: [{ id: "in", label: "PDF", direction: "input", dataType: "pdf" }],
    outputPorts: [{ id: "out", label: "Images", direction: "output", dataType: "images" }],
    defaultConfig: { format: "png", dpi: 300 },
    executorId: "pdf-to-image",
    supportsExecution: false,
    beta: true,
    configForm: PdfToImageConfig,
}
