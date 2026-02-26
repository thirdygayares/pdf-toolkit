import type { NodeTypeId } from "../../types"
import type { NodeExecutor } from "../executor-types"
import { compressPdfExecutor } from "./compress-pdf.executor"
import { extractTextExecutor } from "./extract-text.executor"
import { filterExecutor } from "./filter.executor"
import { imageToPdfExecutor } from "./image-to-pdf.executor"
import { markdownToPdfExecutor } from "./markdown-to-pdf.executor"
import { mergePdfExecutor } from "./merge-pdf.executor"
import { pageNumbersPdfExecutor } from "./page-numbers.executor"
import { pdfToImageExecutor } from "./pdf-to-image.executor"
import { protectPdfExecutor } from "./protect-pdf.executor"
import { renameExecutor } from "./rename.executor"
import { splitPdfExecutor } from "./split-pdf.executor"
import { watermarkPdfExecutor } from "./watermark-pdf.executor"

export const nodeExecutors: Partial<Record<NodeTypeId, NodeExecutor>> = {
    "split-pdf": splitPdfExecutor,
    "merge-pdf": mergePdfExecutor,
    "extract-text": extractTextExecutor,
    "pdf-to-image": pdfToImageExecutor,
    "image-to-pdf": imageToPdfExecutor,
    "markdown-to-pdf": markdownToPdfExecutor,
    "compress-pdf": compressPdfExecutor,
    "watermark-pdf": watermarkPdfExecutor,
    "page-numbers-pdf": pageNumbersPdfExecutor,
    "protect-pdf": protectPdfExecutor,
    filter: filterExecutor,
    rename: renameExecutor,
}
