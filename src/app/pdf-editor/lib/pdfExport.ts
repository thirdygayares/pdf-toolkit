import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib"

import type { PdfAnnotation, TextAnnotation } from "@/app/pdf-editor/lib/types"

export async function drawAnnotationsToPdfPage({
  annotations,
  page,
  font,
  boldFont,
  italicFont,
  boldItalicFont,
  outputDocument,
  imageCache,
}: {
  annotations: PdfAnnotation[]
  page: PDFPage
  font: PDFFont
  boldFont: PDFFont
  italicFont: PDFFont
  boldItalicFont: PDFFont
  outputDocument: PDFDocument
  imageCache: Map<string, PDFImage>
}) {
  const { width: pageWidth, height: pageHeight } = page.getSize()

  for (const annotation of annotations) {
    if (annotation.type === "highlight") {
      page.drawRectangle({
        x: annotation.x * pageWidth,
        y: (1 - annotation.y - annotation.height) * pageHeight,
        width: annotation.width * pageWidth,
        height: annotation.height * pageHeight,
        color: toRgb(annotation.color),
        opacity: annotation.opacity,
      })
      continue
    }

    if (annotation.type === "rectangle") {
      page.drawRectangle({
        x: annotation.x * pageWidth,
        y: (1 - annotation.y - annotation.height) * pageHeight,
        width: annotation.width * pageWidth,
        height: annotation.height * pageHeight,
        borderColor: toRgb(annotation.color),
        borderWidth: annotation.strokeWidth,
        borderOpacity: annotation.opacity,
      })
      continue
    }

    if (annotation.type === "ellipse") {
      page.drawEllipse({
        x: (annotation.x + annotation.width / 2) * pageWidth,
        y: (1 - annotation.y - annotation.height / 2) * pageHeight,
        xScale: (annotation.width * pageWidth) / 2,
        yScale: (annotation.height * pageHeight) / 2,
        borderColor: toRgb(annotation.color),
        borderWidth: annotation.strokeWidth,
        borderOpacity: annotation.opacity,
      })
      continue
    }

    if (annotation.type === "line" || annotation.type === "arrow") {
      const startX = annotation.start.x * pageWidth
      const startY = (1 - annotation.start.y) * pageHeight
      const endX = annotation.end.x * pageWidth
      const endY = (1 - annotation.end.y) * pageHeight

      page.drawLine({
        start: { x: startX, y: startY },
        end: { x: endX, y: endY },
        thickness: annotation.strokeWidth,
        color: toRgb(annotation.color),
        opacity: annotation.opacity,
      })

      if (annotation.type === "arrow") {
        const angle = Math.atan2(endY - startY, endX - startX)
        const headLength = 14

        page.drawLine({
          start: { x: endX, y: endY },
          end: {
            x: endX - headLength * Math.cos(angle - Math.PI / 8),
            y: endY - headLength * Math.sin(angle - Math.PI / 8),
          },
          thickness: annotation.strokeWidth,
          color: toRgb(annotation.color),
          opacity: annotation.opacity,
        })

        page.drawLine({
          start: { x: endX, y: endY },
          end: {
            x: endX - headLength * Math.cos(angle + Math.PI / 8),
            y: endY - headLength * Math.sin(angle + Math.PI / 8),
          },
          thickness: annotation.strokeWidth,
          color: toRgb(annotation.color),
          opacity: annotation.opacity,
        })
      }
      continue
    }

    if (annotation.type === "pen") {
      for (let pointIndex = 1; pointIndex < annotation.points.length; pointIndex += 1) {
        const previousPoint = annotation.points[pointIndex - 1]
        const currentPoint = annotation.points[pointIndex]

        page.drawLine({
          start: {
            x: previousPoint.x * pageWidth,
            y: (1 - previousPoint.y) * pageHeight,
          },
          end: {
            x: currentPoint.x * pageWidth,
            y: (1 - currentPoint.y) * pageHeight,
          },
          thickness: annotation.strokeWidth,
          color: toRgb(annotation.color),
          opacity: annotation.opacity,
        })
      }
      continue
    }

    if (annotation.type === "text") {
      const boxX = annotation.x * pageWidth
      const boxY = (1 - annotation.y - annotation.height) * pageHeight
      const boxWidth = annotation.width * pageWidth
      const boxHeight = annotation.height * pageHeight

      if (annotation.whiteout) {
        page.drawRectangle({
          x: boxX,
          y: boxY,
          width: boxWidth,
          height: boxHeight,
          color: rgb(1, 1, 1),
        })
      }

      const resolvedFont = resolveFont(annotation, font, boldFont, italicFont, boldItalicFont)

      const lines = annotation.text.split("\n")
      const lineHeight = annotation.fontSize * 1.2
      lines.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: boxX + 4,
          y: boxY + boxHeight - (lineIndex + 1) * lineHeight,
          size: annotation.fontSize,
          font: resolvedFont,
          color: toRgb(annotation.color),
          opacity: annotation.opacity,
        })
      })

      if (annotation.underline) {
        const underlineY = boxY + boxHeight - lineHeight + 1
        lines.forEach((line, lineIndex) => {
          const textWidth = resolvedFont.widthOfTextAtSize(line, annotation.fontSize)
          page.drawLine({
            start: { x: boxX + 4, y: underlineY - lineIndex * lineHeight },
            end: { x: boxX + 4 + Math.min(textWidth, boxWidth - 8), y: underlineY - lineIndex * lineHeight },
            thickness: 1,
            color: toRgb(annotation.color),
            opacity: annotation.opacity,
          })
        })
      }

      continue
    }

    if (annotation.type === "image") {
      let image = imageCache.get(annotation.src)
      if (!image) {
        const payload = await fetchImageBytesForPdf(annotation.src)
        image =
          payload.kind === "jpg"
            ? await outputDocument.embedJpg(payload.bytes)
            : await outputDocument.embedPng(payload.bytes)

        imageCache.set(annotation.src, image)
      }

      page.drawImage(image, {
        x: annotation.x * pageWidth,
        y: (1 - annotation.y - annotation.height) * pageHeight,
        width: annotation.width * pageWidth,
        height: annotation.height * pageHeight,
        opacity: annotation.opacity,
      })
    }
  }
}

function resolveFont(
  annotation: TextAnnotation,
  regular: PDFFont,
  bold: PDFFont,
  italic: PDFFont,
  boldItalic: PDFFont,
): PDFFont {
  if (annotation.bold && annotation.italic) return boldItalic
  if (annotation.bold) return bold
  if (annotation.italic) return italic
  return regular
}

export function toRgb(color: string) {
  const normalized = color.replace("#", "")
  const hex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => `${part}${part}`)
          .join("")
      : normalized

  const parsed = Number.parseInt(hex, 16)
  const red = ((parsed >> 16) & 255) / 255
  const green = ((parsed >> 8) & 255) / 255
  const blue = (parsed & 255) / 255

  return rgb(red, green, blue)
}

async function fetchImageBytes(src: string) {
  try {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`received ${response.status} ${response.statusText}`.trim())
    }

    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to fetch image bytes for ${src}: ${message}`)
  }
}

async function fetchImageBytesForPdf(src: string): Promise<{ kind: "png" | "jpg"; bytes: Uint8Array }> {
  const bytes = await fetchImageBytes(src)
  if (isLikelyJpeg(src, bytes)) {
    return { kind: "jpg", bytes }
  }

  if (isLikelyPng(src, bytes)) {
    return { kind: "png", bytes }
  }

  const image = await loadImageViaDom(src)
  const canvas = document.createElement("canvas")
  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height

  const context = canvas.getContext("2d")
  if (!context) {
    return { kind: "png", bytes }
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/png")
  })

  if (!blob) {
    return { kind: "png", bytes }
  }

  const pngBuffer = await blob.arrayBuffer()
  return { kind: "png", bytes: new Uint8Array(pngBuffer) }
}

function isLikelyJpeg(src: string, bytes: Uint8Array) {
  if (src.startsWith("data:image/jpeg") || src.startsWith("data:image/jpg")) return true
  return bytes[0] === 0xff && bytes[1] === 0xd8
}

function isLikelyPng(src: string, bytes: Uint8Array) {
  if (src.startsWith("data:image/png")) return true
  return bytes[0] === 0x89 && bytes[1] === 0x50
}

async function loadImageViaDom(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Failed to load image asset"))
    image.src = src
  })
}

export async function embedStandardFonts(outputDocument: PDFDocument) {
  const [font, boldFont, italicFont, boldItalicFont] = await Promise.all([
    outputDocument.embedFont(StandardFonts.Helvetica),
    outputDocument.embedFont(StandardFonts.HelveticaBold),
    outputDocument.embedFont(StandardFonts.HelveticaOblique),
    outputDocument.embedFont(StandardFonts.HelveticaBoldOblique),
  ])
  return { font, boldFont, italicFont, boldItalicFont }
}
