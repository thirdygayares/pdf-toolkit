import type { NodeExecutor } from "../executor-types"
import { assertNotAborted, ensurePdfPacket } from "./_shared"

const parseRange = (raw: string, pageCount: number) => {
    const selected = new Set<number>()
    const tokens = raw
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean)

    if (tokens.length === 0) {
        throw new Error("Split range is empty.")
    }

    for (const token of tokens) {
        const match = /^(\d+)(?:-(\d+))?$/.exec(token)
        if (!match) {
            throw new Error(`Invalid range token: ${token}`)
        }
        const start = Number.parseInt(match[1], 10)
        const end = match[2] ? Number.parseInt(match[2], 10) : start
        if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
            throw new Error(`Range must be between 1 and ${pageCount}`)
        }
        const from = Math.min(start, end)
        const to = Math.max(start, end)
        for (let page = from; page <= to; page += 1) {
            selected.add(page - 1)
        }
    }

    return Array.from(selected).sort((a, b) => a - b)
}

export const splitPdfExecutor: NodeExecutor = async ({ packet, config, ctx }) => {
    assertNotAborted(ctx.signal)
    const pdfPacket = ensurePdfPacket(packet)
    const { PDFDocument } = await import("pdf-lib")
    const sourceDoc = await PDFDocument.load(pdfPacket.payload)
    const pageCount = sourceDoc.getPageCount()

    const mode = String(config.mode ?? "all")
    let selected: number[] = []

    if (mode === "odd") {
        selected = Array.from({ length: pageCount }, (_, index) => index).filter((index) => (index + 1) % 2 === 1)
    } else if (mode === "even") {
        selected = Array.from({ length: pageCount }, (_, index) => index).filter((index) => (index + 1) % 2 === 0)
    } else if (mode === "range") {
        selected = parseRange(String(config.pageRange ?? ""), pageCount)
    } else {
        selected = Array.from({ length: pageCount }, (_, index) => index)
    }

    if (selected.length === 0) {
        throw new Error("Split PDF produced no selected pages.")
    }

    const outputDoc = await PDFDocument.create()
    const copied = await outputDoc.copyPages(sourceDoc, selected)
    copied.forEach((page) => outputDoc.addPage(page))

    assertNotAborted(ctx.signal)
    const bytes = await outputDoc.save()
    return {
        ...pdfPacket,
        payload: bytes,
        meta: {
            ...pdfPacket.meta,
            pageCount: selected.length,
        },
    }
}
