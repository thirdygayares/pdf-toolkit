import type { NodeExecutor } from "../executor-types"
import { ensurePdfPacket } from "./_shared"

export const filterExecutor: NodeExecutor = async ({ packet, config }) => {
    const pdfPacket = ensurePdfPacket(packet)
    const { PDFDocument } = await import("pdf-lib")
    const doc = await PDFDocument.load(pdfPacket.payload)
    const pageCount = doc.getPageCount()

    const minPages = Math.max(0, Number(config.minPages ?? 0))
    const maxPages = Math.max(0, Number(config.maxPages ?? 0))
    const tooSmall = minPages > 0 && pageCount < minPages
    const tooLarge = maxPages > 0 && pageCount > maxPages

    if (tooSmall || tooLarge) {
        return null
    }

    return {
        ...pdfPacket,
        meta: {
            ...pdfPacket.meta,
            pageCount,
        },
    }
}
