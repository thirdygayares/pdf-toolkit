import type { NodeRegistryEntry } from "../node-registry"
import { compressPdfEntry } from "./compress-pdf.entry"
import { extractTextEntry } from "./extract-text.entry"
import { filterEntry } from "./filter.entry"
import { imageToPdfEntry } from "./image-to-pdf.entry"
import { markdownToPdfEntry } from "./markdown-to-pdf.entry"
import { mergePdfEntry } from "./merge-pdf.entry"
import { pageNumbersEntry } from "./page-numbers.entry"
import { pdfInputEntry } from "./pdf-input.entry"
import { pdfOutputEntry } from "./pdf-output.entry"
import { pdfToImageEntry } from "./pdf-to-image.entry"
import { protectPdfEntry } from "./protect-pdf.entry"
import { renameEntry } from "./rename.entry"
import { splitPdfEntry } from "./split-pdf.entry"
import { watermarkPdfEntry } from "./watermark-pdf.entry"

export const registryEntries: NodeRegistryEntry[] = [
    pdfInputEntry,
    pdfOutputEntry,
    splitPdfEntry,
    mergePdfEntry,
    extractTextEntry,
    pdfToImageEntry,
    imageToPdfEntry,
    markdownToPdfEntry,
    compressPdfEntry,
    watermarkPdfEntry,
    pageNumbersEntry,
    protectPdfEntry,
    filterEntry,
    renameEntry,
]
