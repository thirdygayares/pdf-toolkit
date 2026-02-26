import type { NodeExecutor } from "../executor-types"
import { ensurePdfPacket } from "./_shared"

export const extractTextExecutor: NodeExecutor = async ({ packet, config }) => {
    const pdfPacket = ensurePdfPacket(packet)
    const pdfToTextModule = await import("react-pdftotext")
    const extractor = (pdfToTextModule.default ?? pdfToTextModule) as (file: File) => Promise<string>
    const originalName = String(pdfPacket.meta.originalFileName ?? `${pdfPacket.meta.fileName}.pdf`)
    const copy = new Uint8Array(pdfPacket.payload.byteLength)
    copy.set(pdfPacket.payload)
    const buffer = copy.buffer
    const file = new File([buffer], originalName, { type: "application/pdf" })

    const text = await extractor(file)
    const value = Boolean(config.trim ?? true) ? text.trim() : text

    return {
        type: "text",
        payload: value,
        meta: {
            ...pdfPacket.meta,
            fileName: String(pdfPacket.meta.fileName || "document"),
            extension: "txt",
            mimeType: "text/plain",
        },
    }
}
