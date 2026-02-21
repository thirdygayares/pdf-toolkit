import { degrees, PDFDocument } from "pdf-lib"

import type {
  ArrowAnnotation,
  AnnotationMap,
  EditorPage,
  EditorSnapshot,
  FitMode,
  LineAnnotation,
  PageRotation,
  PdfAnnotation,
  PdfSourceRecord,
  PenAnnotation,
  SourcePageMeta,
} from "@/app/pdf-editor/lib/types"

export const DEFAULT_BLANK_PAGE: SourcePageMeta = {
  width: 612,
  height: 792,
}

export function createId(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function rotateClockwise(rotation: PageRotation): PageRotation {
  const next = (rotation + 90) % 360
  return next as PageRotation
}

export function normalizeRect(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  const x = Math.min(startX, endX)
  const y = Math.min(startY, endY)
  const width = Math.abs(endX - startX)
  const height = Math.abs(endY - startY)

  return {
    x,
    y,
    width,
    height,
  }
}

export function duplicateAnnotation(annotation: PdfAnnotation, nextPageId = annotation.pageId): PdfAnnotation {
  switch (annotation.type) {
    case "pen":
      return {
        ...annotation,
        id: createId("annotation"),
        pageId: nextPageId,
        points: annotation.points.map((point) => ({ ...point })),
      }
    case "line":
    case "arrow":
      return {
        ...annotation,
        id: createId("annotation"),
        pageId: nextPageId,
        start: { ...annotation.start },
        end: { ...annotation.end },
      }
    default:
      return {
        ...annotation,
        id: createId("annotation"),
        pageId: nextPageId,
      }
  }
}

export function cloneAnnotationsByPageId(annotationMap: AnnotationMap): AnnotationMap {
  const entries = Object.entries(annotationMap).map(([pageId, annotations]) => {
    return [
      pageId,
      annotations.map((annotation) => duplicateAnnotation(annotation, pageId)),
    ]
  })

  return Object.fromEntries(entries)
}

export function cloneSnapshot(snapshot: EditorSnapshot): EditorSnapshot {
  return {
    pages: snapshot.pages.map((page) => ({
      ...page,
      source: { ...page.source },
    })),
    annotationsByPageId: Object.fromEntries(
      Object.entries(snapshot.annotationsByPageId).map(([pageId, annotations]) => {
        return [pageId, annotations.map((annotation) => copyAnnotation(annotation, pageId))]
      }),
    ),
    activePageId: snapshot.activePageId,
  }
}

export function getPageDimensions(page: EditorPage, sources: Record<string, PdfSourceRecord>) {
  if (page.source.kind === "blank") {
    return {
      width: page.source.width,
      height: page.source.height,
    }
  }

  const source = sources[page.source.sourceId]
  if (!source) {
    return DEFAULT_BLANK_PAGE
  }

  return source.pages[page.source.sourcePageIndex] ?? DEFAULT_BLANK_PAGE
}

export function getDisplayDimensions(
  page: EditorPage,
  sources: Record<string, PdfSourceRecord>,
  fitMode: FitMode,
  viewportWidth: number,
  viewportHeight: number,
  zoomPercent: number,
) {
  const size = getPageDimensions(page, sources)
  const rotated = page.rotation === 90 || page.rotation === 270
  const width = rotated ? size.height : size.width
  const height = rotated ? size.width : size.height

  const paddedWidth = Math.max(120, viewportWidth - 48)
  const paddedHeight = Math.max(120, viewportHeight - 48)

  const baseScale = zoomPercent / 100
  let scale = baseScale

  if (fitMode === "width") {
    scale = paddedWidth / width
  }

  if (fitMode === "page") {
    scale = Math.min(paddedWidth / width, paddedHeight / height)
  }

  const safeScale = clamp(scale, 0.2, 5)

  return {
    width,
    height,
    scale: safeScale,
    renderedWidth: width * safeScale,
    renderedHeight: height * safeScale,
  }
}

export async function loadPdfSourceFromFile(file: File, sourceId: string): Promise<PdfSourceRecord> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const document = await PDFDocument.load(bytes)
  const pages = document.getPages().map((page) => {
    const { width, height } = page.getSize()
    return {
      width,
      height,
    }
  })

  return {
    id: sourceId,
    name: file.name,
    bytes,
    pages,
  }
}

export function createPagesFromSource(source: PdfSourceRecord): EditorPage[] {
  return source.pages.map((_, pageIndex) => ({
    id: createId("page"),
    source: {
      kind: "source",
      sourceId: source.id,
      sourcePageIndex: pageIndex,
    },
    rotation: 0,
  }))
}

export function createInitialSnapshot(source: PdfSourceRecord): EditorSnapshot {
  const pages = createPagesFromSource(source)

  return {
    pages,
    annotationsByPageId: Object.fromEntries(pages.map((page) => [page.id, []])),
    activePageId: pages[0]?.id ?? null,
  }
}

export async function buildStructuredPdfBytes(
  pages: EditorPage[],
  sources: Record<string, PdfSourceRecord>,
): Promise<Uint8Array> {
  const output = await PDFDocument.create()
  const sourceDocuments = new Map<string, PDFDocument>()

  for (const [sourceId, source] of Object.entries(sources)) {
    sourceDocuments.set(sourceId, await PDFDocument.load(source.bytes))
  }

  for (const page of pages) {
    if (page.source.kind === "blank") {
      const blankPage = output.addPage([page.source.width, page.source.height])
      blankPage.setRotation(degrees(page.rotation))
      continue
    }

    const sourceDocument = sourceDocuments.get(page.source.sourceId)
    if (!sourceDocument) {
      continue
    }

    const [copiedPage] = await output.copyPages(sourceDocument, [page.source.sourcePageIndex])
    copiedPage.setRotation(degrees(page.rotation))
    output.addPage(copiedPage)
  }

  return output.save()
}

export function ensureAnnotations(annotationMap: AnnotationMap, pages: EditorPage[]) {
  const pageIds = new Set(pages.map((page) => page.id))
  const next: AnnotationMap = {}

  for (const pageId of pageIds) {
    next[pageId] = annotationMap[pageId] ?? []
  }

  return next
}

function withClampedRect(annotation: PdfAnnotation): PdfAnnotation {
  switch (annotation.type) {
    case "text":
    case "image":
    case "highlight":
    case "rectangle":
    case "ellipse":
      return {
        ...annotation,
        x: clamp(annotation.x, 0, 1),
        y: clamp(annotation.y, 0, 1),
        width: clamp(annotation.width, 0.01, 1),
        height: clamp(annotation.height, 0.01, 1),
      }
    case "line":
    case "arrow":
      return {
        ...annotation,
        start: {
          x: clamp(annotation.start.x, 0, 1),
          y: clamp(annotation.start.y, 0, 1),
        },
        end: {
          x: clamp(annotation.end.x, 0, 1),
          y: clamp(annotation.end.y, 0, 1),
        },
      }
    case "pen":
      return {
        ...annotation,
        points: annotation.points.map((point) => ({
          x: clamp(point.x, 0, 1),
          y: clamp(point.y, 0, 1),
        })),
      }
    default:
      return annotation
  }
}

export function translateAnnotation(annotation: PdfAnnotation, deltaX: number, deltaY: number): PdfAnnotation {
  switch (annotation.type) {
    case "text":
    case "image":
    case "highlight":
    case "rectangle":
    case "ellipse":
      return withClampedRect({
        ...annotation,
        x: annotation.x + deltaX,
        y: annotation.y + deltaY,
      })
    case "line":
    case "arrow":
      return withClampedRect({
        ...annotation,
        start: {
          x: annotation.start.x + deltaX,
          y: annotation.start.y + deltaY,
        },
        end: {
          x: annotation.end.x + deltaX,
          y: annotation.end.y + deltaY,
        },
      })
    case "pen":
      return withClampedRect({
        ...annotation,
        points: annotation.points.map((point) => ({
          x: point.x + deltaX,
          y: point.y + deltaY,
        })),
      })
    default:
      return annotation
  }
}

export function drawAnnotationOnCanvas(
  context: CanvasRenderingContext2D,
  annotation: PdfAnnotation,
  canvasWidth: number,
  canvasHeight: number,
) {
  context.save()

  if (annotation.type === "highlight") {
    context.globalAlpha = annotation.opacity
    context.fillStyle = annotation.color
    context.fillRect(
      annotation.x * canvasWidth,
      annotation.y * canvasHeight,
      annotation.width * canvasWidth,
      annotation.height * canvasHeight,
    )
    context.restore()
    return
  }

  if (annotation.type === "rectangle") {
    context.globalAlpha = annotation.opacity
    context.strokeStyle = annotation.color
    context.lineWidth = annotation.strokeWidth
    context.strokeRect(
      annotation.x * canvasWidth,
      annotation.y * canvasHeight,
      annotation.width * canvasWidth,
      annotation.height * canvasHeight,
    )
    context.restore()
    return
  }

  if (annotation.type === "ellipse") {
    context.globalAlpha = annotation.opacity
    context.strokeStyle = annotation.color
    context.lineWidth = annotation.strokeWidth

    context.beginPath()
    context.ellipse(
      (annotation.x + annotation.width / 2) * canvasWidth,
      (annotation.y + annotation.height / 2) * canvasHeight,
      (annotation.width * canvasWidth) / 2,
      (annotation.height * canvasHeight) / 2,
      0,
      0,
      Math.PI * 2,
    )
    context.stroke()
    context.restore()
    return
  }

  if (annotation.type === "line" || annotation.type === "arrow") {
    drawLine(context, annotation, canvasWidth, canvasHeight)
    context.restore()
    return
  }

  if (annotation.type === "pen") {
    drawPen(context, annotation, canvasWidth, canvasHeight)
    context.restore()
    return
  }

  if (annotation.type === "text") {
    const left = annotation.x * canvasWidth
    const top = annotation.y * canvasHeight
    const boxWidth = annotation.width * canvasWidth
    const boxHeight = annotation.height * canvasHeight

    if (annotation.whiteout) {
      context.fillStyle = "#ffffff"
      context.fillRect(left, top, boxWidth, boxHeight)
    }

    context.globalAlpha = annotation.opacity
    context.fillStyle = annotation.color
    context.font = `${Math.round(annotation.fontSize)}px ${annotation.fontFamily}`
    context.textBaseline = "top"

    const lineHeight = annotation.fontSize * 1.2
    const lines = annotation.text.split("\n")

    lines.forEach((line, lineIndex) => {
      context.fillText(line, left + 4, top + 4 + lineHeight * lineIndex, boxWidth - 8)
    })

    context.restore()
    return
  }

  if (annotation.type === "image") {
    // Image export is handled by an async exporter where image loading is awaited.
    context.restore()
  }
}

function copyAnnotation(annotation: PdfAnnotation, pageId = annotation.pageId): PdfAnnotation {
  switch (annotation.type) {
    case "pen":
      return {
        ...annotation,
        pageId,
        points: annotation.points.map((point) => ({ ...point })),
      }
    case "line":
    case "arrow":
      return {
        ...annotation,
        pageId,
        start: { ...annotation.start },
        end: { ...annotation.end },
      }
    default:
      return {
        ...annotation,
        pageId,
      }
  }
}

function drawLine(
  context: CanvasRenderingContext2D,
  annotation: LineAnnotation | ArrowAnnotation,
  canvasWidth: number,
  canvasHeight: number,
) {
  const startX = annotation.start.x * canvasWidth
  const startY = annotation.start.y * canvasHeight
  const endX = annotation.end.x * canvasWidth
  const endY = annotation.end.y * canvasHeight

  context.globalAlpha = annotation.opacity
  context.strokeStyle = annotation.color
  context.lineWidth = annotation.strokeWidth
  context.lineCap = "round"

  context.beginPath()
  context.moveTo(startX, startY)
  context.lineTo(endX, endY)
  context.stroke()

  if (annotation.type !== "arrow") {
    return
  }

  const angle = Math.atan2(endY - startY, endX - startX)
  const headLength = 14

  context.beginPath()
  context.moveTo(endX, endY)
  context.lineTo(
    endX - headLength * Math.cos(angle - Math.PI / 8),
    endY - headLength * Math.sin(angle - Math.PI / 8),
  )
  context.lineTo(
    endX - headLength * Math.cos(angle + Math.PI / 8),
    endY - headLength * Math.sin(angle + Math.PI / 8),
  )
  context.closePath()
  context.fillStyle = annotation.color
  context.fill()
}

function drawPen(
  context: CanvasRenderingContext2D,
  annotation: PenAnnotation,
  canvasWidth: number,
  canvasHeight: number,
) {
  if (annotation.points.length < 2) {
    return
  }

  context.globalAlpha = annotation.opacity
  context.strokeStyle = annotation.color
  context.lineWidth = annotation.strokeWidth
  context.lineJoin = "round"
  context.lineCap = "round"

  context.beginPath()
  context.moveTo(annotation.points[0].x * canvasWidth, annotation.points[0].y * canvasHeight)

  for (let index = 1; index < annotation.points.length; index += 1) {
    context.lineTo(annotation.points[index].x * canvasWidth, annotation.points[index].y * canvasHeight)
  }

  context.stroke()
}

export async function canvasToPngBytes(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/png")
  })

  if (!blob) {
    throw new Error("Unable to convert canvas to PNG")
  }

  return new Uint8Array(await blob.arrayBuffer())
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Unable to load image"))
    image.src = url
  })
}
