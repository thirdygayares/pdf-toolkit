"use client"

/**
 * Rasterizes every kind of mark (typed, drawn, uploaded, stamp) into a single,
 * uniform representation: a transparent PNG data URL plus its pixel dimensions.
 * Downstream code (placement + pdf-lib export) only ever deals with PNGs.
 */

const DPR = 4

export interface RasterResult {
    dataUrl: string
    width: number
    height: number
}

async function ensureFontLoaded(fontFamily: string, sizePx: number) {
    if (typeof document === "undefined" || !document.fonts) return
    try {
        await document.fonts.load(`${sizePx}px ${fontFamily}`)
        await document.fonts.ready
    } catch {
        // Fall back to whatever the browser has; rendering still succeeds.
    }
}

/** Crop fully-transparent margins and return the trimmed canvas as a PNG. */
function trimToAsset(canvas: HTMLCanvasElement): RasterResult {
    const ctx = canvas.getContext("2d")
    if (!ctx) {
        return { dataUrl: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height }
    }

    const { width, height } = canvas
    const { data } = ctx.getImageData(0, 0, width, height)

    let top = height
    let left = width
    let right = 0
    let bottom = 0
    let hasInk = false

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const alpha = data[(y * width + x) * 4 + 3]
            if (alpha > 8) {
                hasInk = true
                if (x < left) left = x
                if (x > right) right = x
                if (y < top) top = y
                if (y > bottom) bottom = y
            }
        }
    }

    if (!hasInk) {
        return { dataUrl: canvas.toDataURL("image/png"), width, height }
    }

    const pad = Math.round(DPR * 4)
    left = Math.max(0, left - pad)
    top = Math.max(0, top - pad)
    right = Math.min(width - 1, right + pad)
    bottom = Math.min(height - 1, bottom + pad)

    const cropW = right - left + 1
    const cropH = bottom - top + 1
    const out = document.createElement("canvas")
    out.width = cropW
    out.height = cropH
    const outCtx = out.getContext("2d")
    if (outCtx) {
        outCtx.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH)
    }
    return { dataUrl: out.toDataURL("image/png"), width: cropW, height: cropH }
}

/** Render typed text (a name or initials) in a handwriting font. */
export async function renderTypedSignature(text: string, fontFamily: string, color: string): Promise<RasterResult> {
    const value = text.trim() || "Signature"
    const fontPx = 96
    await ensureFontLoaded(fontFamily, fontPx)

    const measureCanvas = document.createElement("canvas")
    const measureCtx = measureCanvas.getContext("2d")
    if (!measureCtx) throw new Error("Canvas is not available.")
    measureCtx.font = `${fontPx}px ${fontFamily}`
    const textWidth = Math.max(1, Math.ceil(measureCtx.measureText(value).width))

    const padX = Math.ceil(fontPx * 0.35)
    const cssWidth = textWidth + padX * 2
    // Generous vertical room for tall ascenders / deep descenders of script fonts.
    const cssHeight = Math.ceil(fontPx * 2)

    const canvas = document.createElement("canvas")
    canvas.width = cssWidth * DPR
    canvas.height = cssHeight * DPR
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas is not available.")
    ctx.scale(DPR, DPR)
    ctx.font = `${fontPx}px ${fontFamily}`
    ctx.fillStyle = color
    ctx.textBaseline = "middle"
    ctx.textAlign = "left"
    ctx.fillText(value, padX, cssHeight / 2)

    return trimToAsset(canvas)
}

/** Render a rectangular company stamp around uppercase text. */
export async function renderStamp(text: string, color: string): Promise<RasterResult> {
    const value = (text.trim() || "Company").toUpperCase()
    const fontPx = 44
    const fontFamily = "Arial, Helvetica, sans-serif"

    const measureCanvas = document.createElement("canvas")
    const measureCtx = measureCanvas.getContext("2d")
    if (!measureCtx) throw new Error("Canvas is not available.")
    measureCtx.font = `bold ${fontPx}px ${fontFamily}`
    const textWidth = Math.max(1, Math.ceil(measureCtx.measureText(value).width))

    const padX = 36
    const padY = 24
    const cssWidth = textWidth + padX * 2
    const cssHeight = fontPx + padY * 2

    const canvas = document.createElement("canvas")
    canvas.width = cssWidth * DPR
    canvas.height = cssHeight * DPR
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas is not available.")
    ctx.scale(DPR, DPR)

    // Double rounded border.
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    roundedRect(ctx, 4, 4, cssWidth - 8, cssHeight - 8, 10)
    ctx.stroke()
    ctx.lineWidth = 1.5
    roundedRect(ctx, 11, 11, cssWidth - 22, cssHeight - 22, 6)
    ctx.stroke()

    ctx.fillStyle = color
    ctx.font = `bold ${fontPx}px ${fontFamily}`
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.fillText(value, cssWidth / 2, cssHeight / 2)

    return trimToAsset(canvas)
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + w, y, x + w, y + h, radius)
    ctx.arcTo(x + w, y + h, x, y + h, radius)
    ctx.arcTo(x, y + h, x, y, radius)
    ctx.arcTo(x, y, x + w, y, radius)
    ctx.closePath()
}

/** Trim a drawn-signature canvas to its ink bounds. */
export function renderDrawnSignature(source: HTMLCanvasElement): RasterResult {
    return trimToAsset(source)
}

/** Normalize an uploaded image to a PNG data URL (preserves PNG transparency). */
export async function renderUploadedImage(file: File): Promise<RasterResult> {
    const url = URL.createObjectURL(file)
    try {
        const image = await loadImage(url)
        const canvas = document.createElement("canvas")
        canvas.width = image.naturalWidth || image.width
        canvas.height = image.naturalHeight || image.height
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Canvas is not available.")
        ctx.drawImage(image, 0, 0)
        return { dataUrl: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height }
    } finally {
        URL.revokeObjectURL(url)
    }
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error("Could not read that image file."))
        image.src = src
    })
}
