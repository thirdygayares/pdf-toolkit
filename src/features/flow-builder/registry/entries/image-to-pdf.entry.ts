import ImageToPdfConfig from "../../components/config-panel/config-forms/ImageToPdfConfig"
import type { NodeRegistryEntry } from "../node-registry"

export const imageToPdfEntry: NodeRegistryEntry = {
    id: "image-to-pdf",
    label: "Image to PDF",
    description: "Convert image batches to PDF (scaffolded)",
    category: "convert",
    inputPorts: [{ id: "in", label: "Images", direction: "input", dataType: "images" }],
    outputPorts: [{ id: "out", label: "PDF", direction: "output", dataType: "pdf" }],
    defaultConfig: { mode: "unsupported" },
    executorId: "image-to-pdf",
    supportsExecution: false,
    beta: true,
    configForm: ImageToPdfConfig,
}
