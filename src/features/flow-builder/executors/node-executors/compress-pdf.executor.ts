import type { NodeExecutor } from "../executor-types"
import { assertNotAborted, ensurePdfPacket } from "./_shared"

export const compressPdfExecutor: NodeExecutor = async ({ packet, ctx }) => {
    assertNotAborted(ctx.signal)
    const pdfPacket = ensurePdfPacket(packet)
    const { PDFDocument } = await import("pdf-lib")
    const pdfDoc = await PDFDocument.load(pdfPacket.payload)
    assertNotAborted(ctx.signal)

    const saved = await pdfDoc.save({ useObjectStreams: true })

    return {
        ...pdfPacket,
        payload: saved,
        meta: {
            ...pdfPacket.meta,
            notes: [...(Array.isArray(pdfPacket.meta.notes) ? (pdfPacket.meta.notes as string[]) : []), "compressed"],
        },
    }
}
