import type { NodeExecutor } from "../executor-types"
import { assertNotAborted, ensurePdfPacket } from "./_shared"

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        }
        : { r: 0, g: 0, b: 0 }
}

export const watermarkPdfExecutor: NodeExecutor = async ({ packet, config, ctx }) => {
    assertNotAborted(ctx.signal)
    const pdfPacket = ensurePdfPacket(packet)
    const { PDFDocument, rgb, degrees } = await import("pdf-lib")
    const pdfDoc = await PDFDocument.load(pdfPacket.payload)

    const text = String(config.text ?? "CONFIDENTIAL")
    const fontSize = Number(config.fontSize ?? 36)
    const opacity = Number(config.opacity ?? 0.2)
    const color = String(config.color ?? "#888888")
    const rotation = Number(config.rotation ?? 45)
    const { r, g, b } = hexToRgb(color)

    pdfDoc.getPages().forEach((page) => {
        const { width, height } = page.getSize()
        const textWidth = text.length * fontSize * 0.5
        const textHeight = fontSize
        page.drawText(text, {
            x: width / 2 - textWidth / 2,
            y: height / 2 - textHeight / 2,
            size: fontSize,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(rotation),
        })
    })

    assertNotAborted(ctx.signal)
    const saved = await pdfDoc.save()
    return { ...pdfPacket, payload: saved }
}
