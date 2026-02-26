import type { NodeExecutor } from "../executor-types"
import { assertNotAborted, ensurePdfPacket } from "./_shared"

export const pageNumbersPdfExecutor: NodeExecutor = async ({ packet, config, ctx }) => {
    assertNotAborted(ctx.signal)
    const pdfPacket = ensurePdfPacket(packet)
    const { PDFDocument, rgb } = await import("pdf-lib")
    const pdfDoc = await PDFDocument.load(pdfPacket.payload)
    const pages = pdfDoc.getPages()
    const total = pages.length

    const positionX = String(config.positionX ?? "center")
    const positionY = String(config.positionY ?? "bottom")
    const margin = Number(config.margin ?? 24)
    const formatStyle = String(config.formatStyle ?? "n")
    const fontSize = Number(config.fontSize ?? 12)

    pages.forEach((page, index) => {
        const pageNumber = index + 1
        let text = `${pageNumber}`
        if (formatStyle === "n_of_total") text = `${pageNumber} of ${total}`
        if (formatStyle === "dash_n_dash") text = `- ${pageNumber} -`

        const { width, height } = page.getSize()
        const textWidth = text.length * fontSize * 0.5

        let x = margin
        if (positionX === "center") x = width / 2 - textWidth / 2
        if (positionX === "right") x = width - textWidth - margin

        let y = margin
        if (positionY === "top") y = height - margin - fontSize

        page.drawText(text, { x, y, size: fontSize, color: rgb(0, 0, 0) })
    })

    assertNotAborted(ctx.signal)
    const saved = await pdfDoc.save()
    return { ...pdfPacket, payload: saved }
}
