"use client"
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib"
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  ArrowRight,
  Circle,
  Download,
  Eraser,
  Hand,
  Highlighter,
  ImagePlus,
  Loader2,
  MousePointer2,
  Move,
  PenTool,
  Plus,
  Redo2,
  RotateCw,
  Signature,
  Square,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { toast } from "sonner"

import {
  DEFAULT_BLANK_PAGE,
  buildStructuredPdfBytes,
  clamp,
  cloneSnapshot,
  createId,
  createInitialSnapshot,
  createPagesFromSource,
  duplicateAnnotation,
  ensureAnnotations,
  getDisplayDimensions,
  loadPdfSourceFromFile,
  normalizeRect,
  rotateClockwise,
  translateAnnotation,
} from "@/app/pdf-editor/lib/pdfStudio"
import type {
  EditorHistory,
  EditorPage,
  EditorSnapshot,
  FitMode,
  PdfAnnotation,
  PdfSourceRecord,
  PendingAsset,
  StudioTool,
  TextAnnotation,
} from "@/app/pdf-editor/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type ToolButton = {
  tool: StudioTool
  icon: React.ComponentType<{ className?: string }>
  label: string
}

type DragPreview = {
  annotationId: string
  deltaX: number
  deltaY: number
}

type DragSession = {
  annotation: PdfAnnotation
  startX: number
  startY: number
}

type PanSession = {
  clientX: number
  clientY: number
  scrollLeft: number
  scrollTop: number
}

type DrawSession =
  | {
      mode: "shape"
      tool: "highlight" | "rectangle" | "ellipse" | "line" | "arrow"
      startX: number
      startY: number
    }
  | {
      mode: "pen"
    }

type TextDialogState = {
  x: number
  y: number
  whiteout: boolean
}

const TOOL_BUTTONS: ToolButton[] = [
  { tool: "hand", icon: Hand, label: "Hand" },
  { tool: "select", icon: MousePointer2, label: "Select" },
  { tool: "add-text", icon: Type, label: "Add text" },
  { tool: "edit-text", icon: Eraser, label: "Edit text" },
  { tool: "highlighter", icon: Highlighter, label: "Highlighter" },
  { tool: "pen", icon: PenTool, label: "Pen" },
  { tool: "rectangle", icon: Square, label: "Rectangle" },
  { tool: "ellipse", icon: Circle, label: "Circle" },
  { tool: "line", icon: Move, label: "Line" },
  { tool: "arrow", icon: ArrowRight, label: "Arrow" },
]

const HIGHLIGHT_COLORS = ["#facc15", "#22c55e", "#fb7185"]
const STROKE_COLORS = ["#111827", "#2563eb", "#ef4444", "#9333ea"]

const THUMBNAIL_ROW_HEIGHT = 228

export function PdfEditorStudio() {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const insertPdfInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pageViewportRef = useRef<HTMLDivElement>(null)
  const overlayFrameRef = useRef<HTMLDivElement>(null)
  const thumbnailsViewportRef = useRef<HTMLDivElement>(null)

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const signatureDrawRef = useRef(false)

  const drawSessionRef = useRef<DrawSession | null>(null)
  const dragSessionRef = useRef<DragSession | null>(null)
  const panSessionRef = useRef<PanSession | null>(null)

  const [history, setHistory] = useState<EditorHistory | null>(null)
  const [sources, setSources] = useState<Record<string, PdfSourceRecord>>({})
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null)
  const [isBuildingPreview, setIsBuildingPreview] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const previewFileUrlRef = useRef<string | null>(null)
  const stablePageStructureRef = useRef<EditorPage[]>([])

  const [selectedTool, setSelectedTool] = useState<StudioTool>("select")
  const [isSpacePanning, setIsSpacePanning] = useState(false)
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null)
  const [draftAnnotation, setDraftAnnotation] = useState<PdfAnnotation | null>(null)
  const [pendingAsset, setPendingAsset] = useState<PendingAsset | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const [fitMode, setFitMode] = useState<FitMode>("width")
  const [zoomPercent, setZoomPercent] = useState(140)

  const [highlightColor, setHighlightColor] = useState(HIGHLIGHT_COLORS[0])
  const [strokeColor, setStrokeColor] = useState(STROKE_COLORS[0])

  const [pageJumpInput, setPageJumpInput] = useState("1")
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null)

  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
  const [signatureMode, setSignatureMode] = useState<"draw" | "type" | "upload">("draw")
  const [signatureText, setSignatureText] = useState("J. Doe")
  const [signatureUploadDataUrl, setSignatureUploadDataUrl] = useState<string | null>(null)
  const [textDialogOpen, setTextDialogOpen] = useState(false)
  const [textDialogState, setTextDialogState] = useState<TextDialogState | null>(null)
  const [textDraftValue, setTextDraftValue] = useState("")

  const [draggedPageId, setDraggedPageId] = useState<string | null>(null)
  const [thumbnailScrollTop, setThumbnailScrollTop] = useState(0)
  const [thumbnailViewportHeight, setThumbnailViewportHeight] = useState(520)

  const [pageViewportSize, setPageViewportSize] = useState({
    width: 1100,
    height: 900,
  })

  const snapshot = history?.present ?? null
  const pages = useMemo(() => snapshot?.pages ?? [], [snapshot?.pages])
  const effectiveTool = isSpacePanning ? "hand" : selectedTool

  const activePageIndex = useMemo(() => {
    if (!snapshot?.activePageId) {
      return 0
    }
    const index = pages.findIndex((page) => page.id === snapshot.activePageId)
    return index >= 0 ? index : 0
  }, [pages, snapshot?.activePageId])

  const activePage = pages[activePageIndex] ?? null

  const activeAnnotations = useMemo(() => {
    if (!snapshot || !activePage) {
      return []
    }
    return snapshot.annotationsByPageId[activePage.id] ?? []
  }, [activePage, snapshot])

  const display = useMemo(() => {
    if (!activePage) {
      return null
    }

    return getDisplayDimensions(
      activePage,
      sources,
      fitMode,
      pageViewportSize.width,
      pageViewportSize.height,
      zoomPercent,
    )
  }, [activePage, fitMode, pageViewportSize.height, pageViewportSize.width, sources, zoomPercent])

  const visibleThumbnailRange = useMemo(() => {
    if (pages.length === 0) {
      return {
        start: 0,
        end: -1,
      }
    }

    const start = Math.max(0, Math.floor(thumbnailScrollTop / THUMBNAIL_ROW_HEIGHT) - 2)
    const visibleCount = Math.ceil(thumbnailViewportHeight / THUMBNAIL_ROW_HEIGHT) + 4
    const end = Math.min(pages.length - 1, start + visibleCount)

    return {
      start,
      end,
    }
  }, [pages.length, thumbnailScrollTop, thumbnailViewportHeight])

  const visibleThumbnailPages = useMemo(() => {
    if (visibleThumbnailRange.end < visibleThumbnailRange.start) {
      return []
    }

    return pages.slice(visibleThumbnailRange.start, visibleThumbnailRange.end + 1)
  }, [pages, visibleThumbnailRange.end, visibleThumbnailRange.start])

  const structureFingerprint = useMemo(() => {
    if (!snapshot || snapshot.pages.length === 0) {
      return ""
    }

    return snapshot.pages
      .map((page) =>
        page.source.kind === "blank"
          ? `${page.id}:blank:${page.source.width}:${page.source.height}:${page.rotation}`
          : `${page.id}:${page.source.sourceId}:${page.source.sourcePageIndex}:${page.rotation}`,
      )
      .join("|")
  }, [snapshot])

  useEffect(() => {
    previewFileUrlRef.current = previewFileUrl
  }, [previewFileUrl])

  useEffect(() => {
    return () => {
      if (previewFileUrlRef.current) {
        URL.revokeObjectURL(previewFileUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!snapshot) {
      return
    }

    setPageJumpInput(String(activePageIndex + 1))
  }, [activePageIndex, snapshot])

  useEffect(() => {
    const viewport = pageViewportRef.current
    if (!viewport) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      setPageViewportSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const viewport = thumbnailsViewportRef.current
    if (!viewport) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }
      setThumbnailViewportHeight(entry.contentRect.height)
    })

    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!snapshot) {
      stablePageStructureRef.current = []
      return
    }
    stablePageStructureRef.current = snapshot.pages
  }, [snapshot, structureFingerprint])

  useEffect(() => {
    if (!structureFingerprint || Object.keys(sources).length === 0) {
      setPreviewFileUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl)
        }
        return null
      })
      return
    }

    let cancelled = false

    const run = async () => {
      setIsBuildingPreview(true)
      try {
        const bytes = await buildStructuredPdfBytes(stablePageStructureRef.current, sources)
        const safeBytes = new Uint8Array(bytes.length)
        safeBytes.set(bytes)
        const blob = new Blob([safeBytes.buffer], { type: "application/pdf" })
        const nextPreviewUrl = URL.createObjectURL(blob)

        if (cancelled) {
          URL.revokeObjectURL(nextPreviewUrl)
          return
        }

        setPreviewFileUrl((previousUrl) => {
          if (previousUrl) {
            URL.revokeObjectURL(previousUrl)
          }
          return nextPreviewUrl
        })
      } catch (error) {
        console.error(error)
        toast.error("Could not render the PDF preview")
      } finally {
        if (!cancelled) {
          setIsBuildingPreview(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [sources, structureFingerprint])

  const normalizeSnapshot = useCallback((draft: EditorSnapshot): EditorSnapshot => {
    draft.annotationsByPageId = ensureAnnotations(draft.annotationsByPageId, draft.pages)

    if (draft.pages.length === 0) {
      draft.activePageId = null
      return draft
    }

    const hasActive = draft.activePageId && draft.pages.some((page) => page.id === draft.activePageId)
    if (!hasActive) {
      draft.activePageId = draft.pages[0].id
    }

    return draft
  }, [])

  const pushSnapshot = useCallback(
    (updater: (draft: EditorSnapshot) => void) => {
      setHistory((previous) => {
        if (!previous) {
          return previous
        }

        const draft = cloneSnapshot(previous.present)
        updater(draft)

        const nextPresent = normalizeSnapshot(draft)

        return {
          past: [...previous.past, previous.present].slice(-120),
          present: nextPresent,
          future: [],
        }
      })
    },
    [normalizeSnapshot],
  )

  const undo = useCallback(() => {
    setHistory((previous) => {
      if (!previous || previous.past.length === 0) {
        return previous
      }

      const newPast = previous.past.slice(0, -1)
      const restored = previous.past[previous.past.length - 1]

      return {
        past: newPast,
        present: restored,
        future: [previous.present, ...previous.future],
      }
    })
    setSelectedAnnotationId(null)
  }, [])

  const redo = useCallback(() => {
    setHistory((previous) => {
      if (!previous || previous.future.length === 0) {
        return previous
      }

      const [restored, ...remainingFuture] = previous.future

      return {
        past: [...previous.past, previous.present],
        present: restored,
        future: remainingFuture,
      }
    })
    setSelectedAnnotationId(null)
  }, [])

  const loadPrimaryFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported")
      return
    }

    try {
      const sourceId = createId("source")
      const source = await loadPdfSourceFromFile(file, sourceId)
      const initialSnapshot = createInitialSnapshot(source)

      setSources({
        [source.id]: source,
      })
      setHistory({
        past: [],
        present: initialSnapshot,
        future: [],
      })
      setSelectedAnnotationId(null)
      setSelectedTool("select")
      setPendingAsset(null)
      setMobileSidebarOpen(false)
      toast.success("PDF loaded into Studio")
    } catch (error) {
      console.error(error)
      toast.error("Could not open the selected PDF")
    }
  }, [])

  const onUploadChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        await loadPrimaryFile(file)
      }
      event.target.value = ""
    },
    [loadPrimaryFile],
  )

  const openFileDialog = useCallback(() => {
    uploadInputRef.current?.click()
  }, [])

  const setActivePageWithoutHistory = useCallback((pageId: string) => {
    setHistory((previous) => {
      if (!previous || previous.present.activePageId === pageId) {
        return previous
      }

      return {
        ...previous,
        present: {
          ...previous.present,
          activePageId: pageId,
        },
      }
    })
  }, [])

  const setActivePageById = useCallback(
    (pageId: string) => {
      setActivePageWithoutHistory(pageId)
      setSelectedAnnotationId(null)
      setMobileSidebarOpen(false)
    },
    [setActivePageWithoutHistory],
  )

  const rotatePage = useCallback(
    (pageId: string) => {
      pushSnapshot((draft) => {
        const page = draft.pages.find((item) => item.id === pageId)
        if (!page) {
          return
        }
        page.rotation = rotateClockwise(page.rotation)
      })
    },
    [pushSnapshot],
  )

  const duplicatePage = useCallback(
    (pageId: string) => {
      pushSnapshot((draft) => {
        const index = draft.pages.findIndex((item) => item.id === pageId)
        if (index < 0) {
          return
        }

        const page = draft.pages[index]
        const clonedPage: EditorPage = {
          ...page,
          id: createId("page"),
          source: { ...page.source },
        }

        draft.pages.splice(index + 1, 0, clonedPage)

        const pageAnnotations = draft.annotationsByPageId[pageId] ?? []
        draft.annotationsByPageId[clonedPage.id] = pageAnnotations.map((annotation) =>
          duplicateAnnotation(annotation, clonedPage.id),
        )
        draft.activePageId = clonedPage.id
      })
      setSelectedAnnotationId(null)
    },
    [pushSnapshot],
  )

  const deletePage = useCallback(
    (pageId: string) => {
      if (!snapshot || snapshot.pages.length <= 1) {
        toast.error("At least one page must remain in the document")
        return
      }

      pushSnapshot((draft) => {
        const index = draft.pages.findIndex((item) => item.id === pageId)
        if (index < 0) {
          return
        }

        draft.pages.splice(index, 1)
        delete draft.annotationsByPageId[pageId]

        const nextPage = draft.pages[index] ?? draft.pages[index - 1] ?? null
        draft.activePageId = nextPage?.id ?? null
      })
      setSelectedAnnotationId(null)
    },
    [pushSnapshot, snapshot],
  )

  const reorderPage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
        return
      }

      pushSnapshot((draft) => {
        const clampedTarget = clamp(toIndex, 0, draft.pages.length - 1)
        const [moved] = draft.pages.splice(fromIndex, 1)
        draft.pages.splice(clampedTarget, 0, moved)
        draft.activePageId = moved.id
      })
    },
    [pushSnapshot],
  )

  const insertBlankPage = useCallback(
    (index: number) => {
      pushSnapshot((draft) => {
        const blankPage: EditorPage = {
          id: createId("page"),
          source: {
            kind: "blank",
            width: DEFAULT_BLANK_PAGE.width,
            height: DEFAULT_BLANK_PAGE.height,
          },
          rotation: 0,
        }

        draft.pages.splice(clamp(index, 0, draft.pages.length), 0, blankPage)
        draft.annotationsByPageId[blankPage.id] = []
        draft.activePageId = blankPage.id
      })
      setSelectedAnnotationId(null)
    },
    [pushSnapshot],
  )

  const triggerInsertPdf = useCallback((index: number) => {
    setInsertAtIndex(index)
    insertPdfInputRef.current?.click()
  }, [])

  const onInsertPdfChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      const targetIndex = insertAtIndex ?? pages.length
      event.target.value = ""
      setInsertAtIndex(null)

      if (!file) {
        return
      }

      if (file.type !== "application/pdf") {
        toast.error("Only PDF files can be inserted")
        return
      }

      try {
        const sourceId = createId("source")
        const source = await loadPdfSourceFromFile(file, sourceId)
        const insertedPages = createPagesFromSource(source)

        setSources((previous) => ({
          ...previous,
          [source.id]: source,
        }))

        pushSnapshot((draft) => {
          draft.pages.splice(clamp(targetIndex, 0, draft.pages.length), 0, ...insertedPages)
          insertedPages.forEach((page) => {
            draft.annotationsByPageId[page.id] = []
          })
          draft.activePageId = insertedPages[0]?.id ?? draft.activePageId
        })

        toast.success(`${insertedPages.length} page(s) inserted`)
      } catch (error) {
        console.error(error)
        toast.error("Could not insert the PDF")
      }
    },
    [insertAtIndex, pages.length, pushSnapshot],
  )

  const updateAnnotation = useCallback(
    (pageId: string, annotationId: string, updater: (annotation: PdfAnnotation) => PdfAnnotation) => {
      pushSnapshot((draft) => {
        const annotations = draft.annotationsByPageId[pageId] ?? []
        const index = annotations.findIndex((annotation) => annotation.id === annotationId)
        if (index < 0) {
          return
        }
        annotations[index] = updater(annotations[index])
      })
    },
    [pushSnapshot],
  )

  const addAnnotation = useCallback(
    (annotation: PdfAnnotation) => {
      pushSnapshot((draft) => {
        const list = draft.annotationsByPageId[annotation.pageId] ?? []
        draft.annotationsByPageId[annotation.pageId] = [...list, annotation]
      })
      setSelectedAnnotationId(annotation.id)
    },
    [pushSnapshot],
  )

  const removeSelectedAnnotation = useCallback(() => {
    if (!activePage || !selectedAnnotationId) {
      return
    }

    pushSnapshot((draft) => {
      const list = draft.annotationsByPageId[activePage.id] ?? []
      draft.annotationsByPageId[activePage.id] = list.filter((annotation) => annotation.id !== selectedAnnotationId)
    })

    setSelectedAnnotationId(null)
  }, [activePage, pushSnapshot, selectedAnnotationId])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!snapshot) {
        return
      }

      const activeTag = (document.activeElement as HTMLElement | null)?.tagName
      const isTypingInField = activeTag === "INPUT" || activeTag === "TEXTAREA"

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault()
        redo()
        return
      }

      if (event.code === "Space" && !isTypingInField) {
        event.preventDefault()
        setIsSpacePanning(true)
        return
      }

      if (isTypingInField) {
        return
      }

      if ((event.metaKey || event.ctrlKey) && (event.key === "=" || event.key === "+")) {
        event.preventDefault()
        setFitMode("none")
        setZoomPercent((value) => clamp(value + 10, 40, 400))
        return
      }

      if ((event.metaKey || event.ctrlKey) && (event.key === "-" || event.key === "_")) {
        event.preventDefault()
        setFitMode("none")
        setZoomPercent((value) => clamp(value - 10, 40, 400))
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "0") {
        event.preventDefault()
        setFitMode("page")
        return
      }

      if (event.key === "=" || event.key === "+") {
        event.preventDefault()
        setFitMode("none")
        setZoomPercent((value) => clamp(value + 10, 40, 400))
        return
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault()
        setFitMode("none")
        setZoomPercent((value) => clamp(value - 10, 40, 400))
        return
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedAnnotationId) {
        event.preventDefault()
        removeSelectedAnnotation()
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setIsSpacePanning(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [isSpacePanning, redo, removeSelectedAnnotation, selectedAnnotationId, snapshot, undo])

  const setTool = useCallback((tool: StudioTool) => {
    setSelectedTool(tool)

    if (tool !== "image" && tool !== "signature") {
      setPendingAsset(null)
    }
  }, [])

  const onUploadImageAsset = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ""
      if (!file) {
        return
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed")
        return
      }

      const src = URL.createObjectURL(file)
      setPendingAsset({
        type: "image",
        src,
        width: 0.28,
        height: 0.2,
        name: file.name,
      })
      setTool("image")
      toast.success("Click on the page to place the image")
    },
    [setTool],
  )

  const commitSignatureAsset = useCallback(
    (src: string, name: string) => {
      setPendingAsset({
        type: "signature",
        src,
        width: 0.24,
        height: 0.12,
        name,
      })
      setTool("signature")
      setSignatureDialogOpen(false)
      toast.success("Click on the page to place the signature")
    },
    [setTool],
  )

  const generateTypedSignatureDataUrl = useCallback(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 700
    canvas.height = 200
    const context = canvas.getContext("2d")

    if (!context) {
      return null
    }

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "#111827"
    context.font = "bold 96px cursive"
    context.textBaseline = "middle"
    context.fillText(signatureText.trim() || "Signature", 12, canvas.height / 2)

    return canvas.toDataURL("image/png")
  }, [signatureText])

  const startSignatureDrawing = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    signatureDrawRef.current = true
    canvas.setPointerCapture(event.pointerId)

    context.strokeStyle = "#111827"
    context.lineWidth = 3
    context.lineCap = "round"
    context.lineJoin = "round"
    context.beginPath()
    context.moveTo(x, y)
  }, [])

  const continueSignatureDrawing = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!signatureDrawRef.current) {
      return
    }

    const canvas = signatureCanvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    context.lineTo(x, y)
    context.stroke()
  }, [])

  const endSignatureDrawing = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    signatureDrawRef.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])

  const clearSignatureCanvas = useCallback(() => {
    const canvas = signatureCanvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    context.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  const useDrawnSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current
    if (!canvas) {
      return
    }

    const src = canvas.toDataURL("image/png")
    commitSignatureAsset(src, "drawn-signature")
  }, [commitSignatureAsset])

  const useTypedSignature = useCallback(() => {
    const src = generateTypedSignatureDataUrl()
    if (!src) {
      toast.error("Could not render typed signature")
      return
    }

    commitSignatureAsset(src, "typed-signature")
  }, [commitSignatureAsset, generateTypedSignatureDataUrl])

  const onSignatureUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === "string") {
        setSignatureUploadDataUrl(result)
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const useUploadedSignature = useCallback(() => {
    if (!signatureUploadDataUrl) {
      toast.error("Upload a signature image first")
      return
    }

    commitSignatureAsset(signatureUploadDataUrl, "uploaded-signature")
  }, [commitSignatureAsset, signatureUploadDataUrl])

  const getNormalizedPoint = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const frame = overlayFrameRef.current?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect()

    return {
      x: clamp((event.clientX - frame.left) / frame.width, 0, 1),
      y: clamp((event.clientY - frame.top) / frame.height, 0, 1),
    }
  }, [])

  const openTextDialog = useCallback((x: number, y: number, whiteout: boolean) => {
    setTextDialogState({ x, y, whiteout })
    setTextDraftValue(whiteout ? "Updated clause" : "")
    setTextDialogOpen(true)
  }, [])

  const submitTextDialog = useCallback(() => {
    if (!activePage || !textDialogState) {
      return
    }

    const normalizedText = textDraftValue.trim()
    if (!normalizedText) {
      toast.error("Please enter text")
      return
    }

    const annotation: TextAnnotation = {
      id: createId("annotation"),
      pageId: activePage.id,
      type: "text",
      x: textDialogState.x,
      y: textDialogState.y,
      width: textDialogState.whiteout ? 0.34 : 0.25,
      height: 0.1,
      text: normalizedText,
      color: strokeColor,
      opacity: 1,
      strokeWidth: 1,
      fontSize: 18,
      fontFamily: "Helvetica",
      whiteout: textDialogState.whiteout,
    }

    addAnnotation(annotation)
    setTextDialogOpen(false)
    setTextDialogState(null)
    setTextDraftValue("")
    setTool("select")
  }, [activePage, addAnnotation, strokeColor, textDialogState, textDraftValue, setTool])

  const beginOverlayInteraction = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!activePage || !display) {
        return
      }

      if (event.button !== 0) {
        return
      }

      if (effectiveTool === "hand") {
        const viewport = pageViewportRef.current
        if (!viewport) {
          return
        }

        event.currentTarget.setPointerCapture(event.pointerId)

        panSessionRef.current = {
          clientX: event.clientX,
          clientY: event.clientY,
          scrollLeft: viewport.scrollLeft,
          scrollTop: viewport.scrollTop,
        }

        return
      }

      const point = getNormalizedPoint(event)

      if (effectiveTool === "select") {
        setSelectedAnnotationId(null)
        return
      }

      if (effectiveTool === "add-text") {
        openTextDialog(point.x, point.y, false)
        return
      }

      if (effectiveTool === "edit-text") {
        openTextDialog(point.x, point.y, true)
        return
      }

      if ((effectiveTool === "image" || effectiveTool === "signature") && pendingAsset) {
        const width = pendingAsset.width
        const height = pendingAsset.height

        addAnnotation({
          id: createId("annotation"),
          pageId: activePage.id,
          type: "image",
          x: clamp(point.x - width / 2, 0, 1 - width),
          y: clamp(point.y - height / 2, 0, 1 - height),
          width,
          height,
          src: pendingAsset.src,
          color: "#111827",
          opacity: 1,
          strokeWidth: 0,
        })

        setPendingAsset(null)
        setTool("select")
        return
      }

      if ((effectiveTool === "image" || effectiveTool === "signature") && !pendingAsset) {
        toast.error("Pick an asset first from the toolbar")
        return
      }

      if (effectiveTool === "pen") {
        event.currentTarget.setPointerCapture(event.pointerId)
        drawSessionRef.current = {
          mode: "pen",
        }

        setDraftAnnotation({
          id: createId("annotation"),
          pageId: activePage.id,
          type: "pen",
          points: [point],
          color: strokeColor,
          opacity: 0.95,
          strokeWidth: 2.6,
        })

        return
      }

      if (
        effectiveTool === "highlighter" ||
        effectiveTool === "rectangle" ||
        effectiveTool === "ellipse" ||
        effectiveTool === "line" ||
        effectiveTool === "arrow"
      ) {
        event.currentTarget.setPointerCapture(event.pointerId)
        drawSessionRef.current = {
          mode: "shape",
          tool:
            effectiveTool === "highlighter"
              ? "highlight"
              : effectiveTool === "rectangle"
                ? "rectangle"
                : effectiveTool === "ellipse"
                  ? "ellipse"
                  : effectiveTool === "line"
                    ? "line"
                    : "arrow",
          startX: point.x,
          startY: point.y,
        }

        const shapeId = createId("annotation")

        if (effectiveTool === "line" || effectiveTool === "arrow") {
          setDraftAnnotation({
            id: shapeId,
            pageId: activePage.id,
            type: effectiveTool,
            start: point,
            end: point,
            color: strokeColor,
            opacity: 0.9,
            strokeWidth: 2.4,
          })
          return
        }

        setDraftAnnotation({
          id: shapeId,
          pageId: activePage.id,
          type: effectiveTool === "highlighter" ? "highlight" : effectiveTool,
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
          color: effectiveTool === "highlighter" ? highlightColor : strokeColor,
          opacity: effectiveTool === "highlighter" ? 0.34 : 0.9,
          strokeWidth: 2,
        })
      }
    },
    [
      activePage,
      addAnnotation,
      display,
      effectiveTool,
      getNormalizedPoint,
      highlightColor,
      openTextDialog,
      pendingAsset,
      setTool,
      strokeColor,
    ],
  )

  const moveOverlayInteraction = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const point = getNormalizedPoint(event)

      if (panSessionRef.current) {
        const viewport = pageViewportRef.current
        if (!viewport) {
          return
        }

        const pan = panSessionRef.current
        viewport.scrollLeft = pan.scrollLeft - (event.clientX - pan.clientX)
        viewport.scrollTop = pan.scrollTop - (event.clientY - pan.clientY)
      }

      if (dragSessionRef.current && display) {
        const drag = dragSessionRef.current
        setDragPreview({
          annotationId: drag.annotation.id,
          deltaX: point.x - drag.startX,
          deltaY: point.y - drag.startY,
        })
      }

      const drawSession = drawSessionRef.current
      if (!drawSession || !draftAnnotation) {
        return
      }

      if (drawSession.mode === "pen" && draftAnnotation.type === "pen") {
        setDraftAnnotation({
          ...draftAnnotation,
          points: [...draftAnnotation.points, point],
        })
        return
      }

      if (drawSession.mode === "shape") {
        if (draftAnnotation.type === "line" || draftAnnotation.type === "arrow") {
          setDraftAnnotation({
            ...draftAnnotation,
            end: point,
          })
          return
        }

        if (
          draftAnnotation.type === "highlight" ||
          draftAnnotation.type === "rectangle" ||
          draftAnnotation.type === "ellipse"
        ) {
          const rect = normalizeRect(drawSession.startX, drawSession.startY, point.x, point.y)
          setDraftAnnotation({
            ...draftAnnotation,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          })
        }
      }
    },
    [display, draftAnnotation, getNormalizedPoint],
  )

  const endOverlayInteraction = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const point = getNormalizedPoint(event)

      if (dragSessionRef.current && dragPreview && activePage) {
        const moved = translateAnnotation(
          dragSessionRef.current.annotation,
          dragPreview.deltaX,
          dragPreview.deltaY,
        )

        updateAnnotation(activePage.id, dragSessionRef.current.annotation.id, () => moved)
      }

      const drawSession = drawSessionRef.current
      if (drawSession && draftAnnotation) {
        if (draftAnnotation.type === "pen" && draftAnnotation.points.length >= 2) {
          addAnnotation(draftAnnotation)
        }

        if ((draftAnnotation.type === "line" || draftAnnotation.type === "arrow") && drawSession.mode === "shape") {
          const deltaX = Math.abs(draftAnnotation.start.x - draftAnnotation.end.x)
          const deltaY = Math.abs(draftAnnotation.start.y - draftAnnotation.end.y)
          if (deltaX > 0.002 || deltaY > 0.002) {
            addAnnotation(draftAnnotation)
          }
        }

        if (
          (draftAnnotation.type === "highlight" ||
            draftAnnotation.type === "rectangle" ||
            draftAnnotation.type === "ellipse") &&
          drawSession.mode === "shape"
        ) {
          const width = Math.abs(draftAnnotation.width)
          const height = Math.abs(draftAnnotation.height)

          if (width > 0.005 && height > 0.005) {
            addAnnotation(draftAnnotation)
          }
        }
      }

      if (panSessionRef.current) {
        panSessionRef.current = null
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      drawSessionRef.current = null
      dragSessionRef.current = null
      setDraftAnnotation(null)
      setDragPreview(null)
      void point
    },
    [activePage, addAnnotation, dragPreview, draftAnnotation, getNormalizedPoint, updateAnnotation],
  )

  const startAnnotationDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, annotation: PdfAnnotation) => {
      if (effectiveTool !== "select") {
        return
      }

      event.stopPropagation()
      const point = getNormalizedPoint(event)

      dragSessionRef.current = {
        annotation,
        startX: point.x,
        startY: point.y,
      }
      setSelectedAnnotationId(annotation.id)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [effectiveTool, getNormalizedPoint],
  )

  const exportPdf = useCallback(async () => {
    if (!snapshot || Object.keys(sources).length === 0) {
      return
    }

    setIsExporting(true)

    try {
      const structuredBytes = await buildStructuredPdfBytes(snapshot.pages, sources)
      const outputDocument = await PDFDocument.load(structuredBytes)
      const helvetica = await outputDocument.embedFont(StandardFonts.Helvetica)
      const imageCache = new Map<string, PDFImage>()

      for (let pageIndex = 0; pageIndex < outputDocument.getPageCount(); pageIndex += 1) {
        const page = outputDocument.getPage(pageIndex)
        const pageId = snapshot.pages[pageIndex].id
        const annotations = snapshot.annotationsByPageId[pageId] ?? []

        await drawAnnotationsToPdfPage({
          annotations,
          page,
          font: helvetica,
          outputDocument,
          imageCache,
        })
      }

      const bytes = await outputDocument.save()
      const blobBytes = new Uint8Array(bytes.length)
      blobBytes.set(bytes)
      const blob = new Blob([blobBytes.buffer], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = "edited-document.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Export completed")
    } catch (error) {
      console.error(error)
      toast.error("Export failed")
    } finally {
      setIsExporting(false)
    }
  }, [snapshot, sources])

  const onPageJumpSubmit = useCallback(() => {
    if (!snapshot) {
      return
    }

    const parsed = Number(pageJumpInput)
    if (!Number.isFinite(parsed)) {
      setPageJumpInput(String(activePageIndex + 1))
      return
    }

    const targetIndex = clamp(Math.floor(parsed) - 1, 0, snapshot.pages.length - 1)
    const targetPage = snapshot.pages[targetIndex]
    if (!targetPage) {
      return
    }

    setActivePageWithoutHistory(targetPage.id)
  }, [activePageIndex, pageJumpInput, setActivePageWithoutHistory, snapshot])

  const zoomIn = useCallback(() => {
    setFitMode("none")
    setZoomPercent((value) => clamp(value + 10, 40, 400))
  }, [])

  const zoomOut = useCallback(() => {
    setFitMode("none")
    setZoomPercent((value) => clamp(value - 10, 40, 400))
  }, [])

  if (!snapshot) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <input
          ref={uploadInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onUploadChange}
        />

        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)] px-6 py-10">
          <div className="w-full max-w-4xl rounded-3xl border border-border/80 bg-card/90 p-10 shadow-2xl backdrop-blur-sm">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">PDF Studio</p>
                <h1 className="mt-3 text-3xl font-semibold">Full-Suite PDF Editor & Annotator</h1>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                  Rearrange pages, rotate scans, highlight clauses, add signatures, and insert images in one
                  workspace.
                </p>
              </div>
              <div className="hidden rounded-2xl border border-dashed border-primary/40 px-4 py-2 text-xs font-medium text-primary md:block">
                Local-first editing
              </div>
            </div>

            <button
              type="button"
              onClick={openFileDialog}
              onDragOver={(event) => event.preventDefault()}
              onDrop={async (event) => {
                event.preventDefault()
                const file = event.dataTransfer.files?.[0]
                if (file) {
                  await loadPrimaryFile(file)
                }
              }}
              className="group flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-primary/35 bg-primary/5 px-10 py-16 text-center transition hover:border-primary/70 hover:bg-primary/10"
            >
              <Plus className="mb-4 size-8 text-primary transition group-hover:scale-110" />
              <p className="text-base font-semibold">Drop your PDF here or click to upload</p>
              <p className="mt-2 text-sm text-muted-foreground">Supports large contracts and multipage documents</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <input
        ref={uploadInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onUploadChange}
      />
      <input
        ref={insertPdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onInsertPdfChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onUploadImageAsset}
      />

      <header className="border-b border-border/70 bg-card/90 px-3 py-3 backdrop-blur lg:px-4">
        <div className="mb-2 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 lg:hidden"
            onClick={() => setMobileSidebarOpen((value) => !value)}
          >
            {mobileSidebarOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
            Pages
          </Button>

          <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Studio
          </div>

          <div className="ml-auto hidden text-xs text-muted-foreground lg:flex">Hold `Space` to pan · `⌘/Ctrl +/-` to zoom</div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-2 pr-2">
            {TOOL_BUTTONS.map((button) => {
              const Icon = button.icon
              const isActive = selectedTool === button.tool

              return (
                <Button
                  key={button.tool}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn("gap-2", isActive && "shadow-sm")}
                  onClick={() => setTool(button.tool)}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{button.label}</span>
                </Button>
              )
            })}

            <Separator orientation="vertical" className="mx-1 h-6" />

            <div className="flex items-center gap-1 rounded-md border border-border/70 bg-muted/25 px-2 py-1">
              <span className="px-1 text-[11px] font-medium text-muted-foreground">Highlight</span>
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Select highlight color ${color}`}
                  onClick={() => {
                    setHighlightColor(color)
                    setTool("highlighter")
                  }}
                  className={cn(
                    "size-6 rounded-full border transition",
                    color === highlightColor ? "ring-2 ring-primary/70" : "hover:scale-105",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-md border border-border/70 bg-muted/25 px-2 py-1">
              <span className="px-1 text-[11px] font-medium text-muted-foreground">Stroke</span>
              {STROKE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Select stroke color ${color}`}
                  onClick={() => {
                    setStrokeColor(color)
                    if (selectedTool === "select" || selectedTool === "hand") {
                      setTool("pen")
                    }
                  }}
                  className={cn(
                    "size-6 rounded-full border transition",
                    color === strokeColor ? "ring-2 ring-primary/70" : "hover:scale-105",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => imageInputRef.current?.click()}>
              <ImagePlus className="size-4" />
              <span className="hidden sm:inline">Image</span>
            </Button>

            <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => setSignatureDialogOpen(true)}>
              <Signature className="size-4" />
              <span className="hidden sm:inline">Signature</span>
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={undo}
              disabled={(history?.past.length ?? 0) === 0}
            >
              <Undo2 className="size-4" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={redo}
              disabled={(history?.future.length ?? 0) === 0}
            >
              <Redo2 className="size-4" />
              <span className="hidden sm:inline">Redo</span>
            </Button>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              {pendingAsset ? (
                <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-xs text-primary">
                  Place {pendingAsset.type}: {pendingAsset.name}
                </span>
              ) : null}

              <Button type="button" size="sm" variant="secondary" onClick={() => triggerInsertPdf(pages.length)}>
                Insert PDF
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => insertBlankPage(pages.length)}>
                Insert Blank
              </Button>
              <Button type="button" size="sm" className="gap-2" onClick={exportPdf} disabled={isExporting || isBuildingPreview}>
                {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {mobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Close page sidebar"
            className="absolute inset-0 z-30 bg-black/35 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            "z-40 flex w-[min(85vw,20rem)] flex-col border-r border-border/70 bg-card/95 backdrop-blur transition-transform lg:w-72 lg:bg-card/70",
            "absolute inset-y-0 left-0 lg:static",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="border-b border-border/70 px-3 py-3">
            <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={() => insertBlankPage(0)}>
              <Plus className="size-4" />
              Insert at beginning
            </Button>
          </div>

          <div
            ref={thumbnailsViewportRef}
            className="flex-1 overflow-y-auto px-3 py-3"
            onScroll={(event) => setThumbnailScrollTop(event.currentTarget.scrollTop)}
          >
            <div style={{ height: visibleThumbnailRange.start * THUMBNAIL_ROW_HEIGHT }} />

            {previewFileUrl ? (
              <Document file={previewFileUrl} loading={<div className="text-xs text-muted-foreground">Loading thumbnails...</div>}>
                {visibleThumbnailPages.map((page, offset) => {
                  const index = visibleThumbnailRange.start + offset
                  const selected = page.id === activePage?.id

                  return (
                    <div key={page.id} className="mb-2" style={{ height: THUMBNAIL_ROW_HEIGHT - 8 }}>
                      <div
                        className={cn(
                          "rounded-xl border bg-background p-2 shadow-sm transition",
                          selected ? "border-primary ring-2 ring-primary/30" : "border-border/70",
                          draggedPageId === page.id && "opacity-50",
                        )}
                        draggable
                        onDragStart={() => setDraggedPageId(page.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (!draggedPageId) {
                            return
                          }
                          const fromIndex = pages.findIndex((item) => item.id === draggedPageId)
                          reorderPage(fromIndex, index)
                          setDraggedPageId(null)
                        }}
                        onDragEnd={() => setDraggedPageId(null)}
                      >
                        <button
                          type="button"
                          onClick={() => setActivePageById(page.id)}
                          className="group block w-full text-left"
                        >
                          <div className="flex items-center justify-between pb-2 text-xs font-medium text-muted-foreground">
                            <span>Page {index + 1}</span>
                            <span>{page.rotation}°</span>
                          </div>
                          <div className="overflow-hidden rounded-lg border border-border bg-white">
                            <Page
                              pageNumber={index + 1}
                              width={220}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              loading={<div className="h-28 bg-muted/60" />}
                            />
                          </div>
                        </button>

                        <div className="mt-2 flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => rotatePage(page.id)}
                          >
                            <RotateCw className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => duplicatePage(page.id)}
                          >
                            <Plus className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            onClick={() => deletePage(page.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="ghost" size="icon" className="ml-auto size-8">
                                <Plus className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => insertBlankPage(index + 1)}>Insert blank after</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => triggerInsertPdf(index + 1)}>Insert PDF after</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => reorderPage(index, Math.max(0, index - 1))}>Move up</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => reorderPage(index, Math.min(pages.length - 1, index + 1))}>Move down</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </Document>
            ) : (
              <div className="rounded-xl border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
                Preparing page previews...
              </div>
            )}

            <div style={{ height: (pages.length - visibleThumbnailRange.end - 1) * THUMBNAIL_ROW_HEIGHT }} />
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div ref={pageViewportRef} className="surface-grid relative flex-1 overflow-auto bg-muted/40 p-3 sm:p-4 lg:p-6">
            <div className="flex min-h-full min-w-full items-center justify-center">
              {!previewFileUrl || !activePage || !display ? (
                <div className="rounded-xl border border-dashed border-border bg-card px-8 py-12 text-sm text-muted-foreground">
                  {isBuildingPreview ? "Building live preview..." : "No page selected"}
                </div>
              ) : (
                <Document
                  file={previewFileUrl}
                  loading={
                    <div className="rounded-xl border border-border bg-card px-8 py-10 text-sm text-muted-foreground">
                      Rendering page...
                    </div>
                  }
                >
                  <div
                    className="relative overflow-hidden rounded-lg border border-border bg-white shadow-2xl"
                    style={{
                      width: display.renderedWidth,
                      height: display.renderedHeight,
                    }}
                  >
                    <Page
                      pageNumber={activePageIndex + 1}
                      width={Math.round(display.renderedWidth)}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />

                    <div
                      ref={overlayFrameRef}
                      className={cn(
                        "absolute inset-0",
                        effectiveTool === "hand" ? "cursor-grab" : "cursor-crosshair",
                        effectiveTool === "select" && "cursor-default",
                      )}
                      onPointerDown={beginOverlayInteraction}
                      onPointerMove={moveOverlayInteraction}
                      onPointerUp={endOverlayInteraction}
                    >
                      {activeAnnotations.map((annotation) => {
                        if (annotation.type === "line" || annotation.type === "arrow" || annotation.type === "pen") {
                          return null
                        }

                        const isSelected = selectedAnnotationId === annotation.id
                        const currentDrag = dragPreview?.annotationId === annotation.id ? dragPreview : null

                        const baseStyle: React.CSSProperties = {
                          left: `${annotation.x * 100}%`,
                          top: `${annotation.y * 100}%`,
                          width: `${annotation.width * 100}%`,
                          height: `${annotation.height * 100}%`,
                          transform: currentDrag
                            ? `translate(${currentDrag.deltaX * display.renderedWidth}px, ${currentDrag.deltaY * display.renderedHeight}px)`
                            : undefined,
                          opacity: annotation.opacity,
                        }

                        if (annotation.type === "highlight") {
                          return (
                            <div
                              key={annotation.id}
                              role="button"
                              tabIndex={0}
                              onPointerDown={(event) => startAnnotationDrag(event, annotation)}
                              onPointerMove={moveOverlayInteraction}
                              onPointerUp={endOverlayInteraction}
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedAnnotationId(annotation.id)
                              }}
                              className={cn("absolute", isSelected && "ring-2 ring-primary/60")}
                              style={{
                                ...baseStyle,
                                backgroundColor: annotation.color,
                              }}
                            />
                          )
                        }

                        if (annotation.type === "rectangle") {
                          return (
                            <div
                              key={annotation.id}
                              role="button"
                              tabIndex={0}
                              onPointerDown={(event) => startAnnotationDrag(event, annotation)}
                              onPointerMove={moveOverlayInteraction}
                              onPointerUp={endOverlayInteraction}
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedAnnotationId(annotation.id)
                              }}
                              className={cn("absolute border-2", isSelected && "ring-2 ring-primary/60")}
                              style={{
                                ...baseStyle,
                                borderColor: annotation.color,
                              }}
                            />
                          )
                        }

                        if (annotation.type === "ellipse") {
                          return (
                            <div
                              key={annotation.id}
                              role="button"
                              tabIndex={0}
                              onPointerDown={(event) => startAnnotationDrag(event, annotation)}
                              onPointerMove={moveOverlayInteraction}
                              onPointerUp={endOverlayInteraction}
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedAnnotationId(annotation.id)
                              }}
                              className={cn("absolute rounded-full border-2", isSelected && "ring-2 ring-primary/60")}
                              style={{
                                ...baseStyle,
                                borderColor: annotation.color,
                              }}
                            />
                          )
                        }

                        if (annotation.type === "text") {
                          return (
                            <div
                              key={annotation.id}
                              role="button"
                              tabIndex={0}
                              onPointerDown={(event) => startAnnotationDrag(event, annotation)}
                              onPointerMove={moveOverlayInteraction}
                              onPointerUp={endOverlayInteraction}
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedAnnotationId(annotation.id)
                              }}
                              className={cn(
                                "absolute overflow-hidden rounded-sm px-1.5 py-1 text-[13px] leading-snug whitespace-pre-wrap",
                                isSelected && "ring-2 ring-primary/60",
                              )}
                              style={{
                                ...baseStyle,
                                color: annotation.color,
                                backgroundColor: annotation.whiteout ? "#ffffff" : undefined,
                              }}
                            >
                              {annotation.text}
                            </div>
                          )
                        }

                        return (
                          <div
                            key={annotation.id}
                            role="button"
                            tabIndex={0}
                            onPointerDown={(event) => startAnnotationDrag(event, annotation)}
                            onPointerMove={moveOverlayInteraction}
                            onPointerUp={endOverlayInteraction}
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedAnnotationId(annotation.id)
                            }}
                            className={cn("absolute overflow-hidden rounded-sm", isSelected && "ring-2 ring-primary/60")}
                            style={baseStyle}
                          >
                            <img
                              src={annotation.src}
                              alt="Inserted annotation"
                              className="size-full object-contain"
                              draggable={false}
                            />
                          </div>
                        )
                      })}

                      <svg className="pointer-events-none absolute inset-0 size-full">
                        {activeAnnotations.map((annotation) => {
                          const isSelected = selectedAnnotationId === annotation.id

                          if (annotation.type === "line" || annotation.type === "arrow") {
                            const x1 = annotation.start.x * 100
                            const y1 = annotation.start.y * 100
                            const x2 = annotation.end.x * 100
                            const y2 = annotation.end.y * 100

                            return (
                              <g key={annotation.id} opacity={annotation.opacity}>
                                <line
                                  x1={`${x1}%`}
                                  y1={`${y1}%`}
                                  x2={`${x2}%`}
                                  y2={`${y2}%`}
                                  stroke={annotation.color}
                                  strokeWidth={annotation.strokeWidth}
                                  strokeLinecap="round"
                                />

                                {annotation.type === "arrow" ? (
                                  <ArrowHead
                                    startX={x1}
                                    startY={y1}
                                    endX={x2}
                                    endY={y2}
                                    color={annotation.color}
                                  />
                                ) : null}

                                {isSelected ? (
                                  <circle
                                    cx={`${x2}%`}
                                    cy={`${y2}%`}
                                    r={6}
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth={2}
                                  />
                                ) : null}
                              </g>
                            )
                          }

                          if (annotation.type === "pen") {
                            const points = annotation.points
                              .map((point, index) => `${index === 0 ? "M" : "L"}${point.x * 100},${point.y * 100}`)
                              .join(" ")

                            return (
                              <path
                                key={annotation.id}
                                d={points}
                                fill="none"
                                opacity={annotation.opacity}
                                stroke={annotation.color}
                                strokeWidth={annotation.strokeWidth}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                              />
                            )
                          }

                          return null
                        })}

                        {draftAnnotation ? <DraftAnnotation annotation={draftAnnotation} /> : null}
                      </svg>
                    </div>
                  </div>
                </Document>
              )}
            </div>
          </div>

          <footer className="border-t border-border/70 bg-card/80 px-3 py-3 sm:px-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">Page</span>
              <Input
                value={pageJumpInput}
                onChange={(event) => setPageJumpInput(event.target.value)}
                onBlur={onPageJumpSubmit}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onPageJumpSubmit()
                  }
                }}
                className="h-8 w-20"
              />
              <span className="text-sm text-muted-foreground">of {pages.length}</span>

              <Separator orientation="vertical" className="mx-1 h-6" />

              <Button type="button" variant="outline" size="icon" className="size-8" onClick={zoomOut}>
                <ZoomOut className="size-4" />
              </Button>
              <span className="w-16 text-center text-sm font-medium">{Math.round(display?.scale ? display.scale * 100 : zoomPercent)}%</span>
              <Button type="button" variant="outline" size="icon" className="size-8" onClick={zoomIn}>
                <ZoomIn className="size-4" />
              </Button>

              <Separator orientation="vertical" className="mx-1 h-6" />

              <Button
                type="button"
                variant={fitMode === "width" ? "default" : "outline"}
                size="sm"
                onClick={() => setFitMode("width")}
              >
                Fit width
              </Button>
              <Button
                type="button"
                variant={fitMode === "page" ? "default" : "outline"}
                size="sm"
                onClick={() => setFitMode("page")}
              >
                Fit page
              </Button>
              <Button type="button" variant={fitMode === "none" ? "default" : "outline"} size="sm" onClick={() => setFitMode("none")}>
                Manual
              </Button>

              <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                <ArrowLeftRight className="size-3.5" />
                Drag thumbnails to reorder
              </div>

              <div className="w-full text-[11px] text-muted-foreground lg:hidden">
                Shortcuts: Hold Space to pan, Ctrl/Cmd +/- to zoom, Ctrl/Cmd 0 for fit page.
              </div>
            </div>
          </footer>
        </main>
      </div>

      <Dialog
        open={textDialogOpen}
        onOpenChange={(open) => {
          setTextDialogOpen(open)
          if (!open) {
            setTextDialogState(null)
            setTextDraftValue("")
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{textDialogState?.whiteout ? "Edit Existing Text" : "Add Text"}</DialogTitle>
            <DialogDescription>
              {textDialogState?.whiteout
                ? "Whiteout + overlay mode for precise PDF correction."
                : "Type the text you want to place on the current page."}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={textDraftValue}
            onChange={(event) => setTextDraftValue(event.target.value)}
            placeholder={textDialogState?.whiteout ? "Updated clause..." : "Type your note..."}
            rows={5}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTextDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitTextDialog}>
              Place Text
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Signature</DialogTitle>
            <DialogDescription>Draw, type, or upload your signature and place it anywhere in the PDF.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={signatureMode === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => setSignatureMode("draw")}
            >
              Draw
            </Button>
            <Button
              type="button"
              variant={signatureMode === "type" ? "default" : "outline"}
              size="sm"
              onClick={() => setSignatureMode("type")}
            >
              Type
            </Button>
            <Button
              type="button"
              variant={signatureMode === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => setSignatureMode("upload")}
            >
              Upload
            </Button>
          </div>

          {signatureMode === "draw" ? (
            <div className="space-y-3">
              <canvas
                ref={signatureCanvasRef}
                width={900}
                height={280}
                className="h-52 w-full rounded-xl border border-border bg-white"
                onPointerDown={startSignatureDrawing}
                onPointerMove={continueSignatureDrawing}
                onPointerUp={endSignatureDrawing}
              />
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={clearSignatureCanvas}>
                  Clear
                </Button>
                <Button type="button" size="sm" onClick={useDrawnSignature}>
                  Use drawn signature
                </Button>
              </div>
            </div>
          ) : null}

          {signatureMode === "type" ? (
            <div className="space-y-3">
              <Input
                value={signatureText}
                onChange={(event) => setSignatureText(event.target.value)}
                placeholder="Type signature text"
              />
              <div className="rounded-xl border border-border bg-white p-5 text-4xl" style={{ fontFamily: "cursive" }}>
                {signatureText || "Signature"}
              </div>
              <Button type="button" size="sm" onClick={useTypedSignature}>
                Use typed signature
              </Button>
            </div>
          ) : null}

          {signatureMode === "upload" ? (
            <div className="space-y-3">
              <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={onSignatureUpload} />
              {signatureUploadDataUrl ? (
                <div className="rounded-xl border border-border bg-muted/20 p-3">
                  <img src={signatureUploadDataUrl} alt="Uploaded signature" className="max-h-36 object-contain" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Upload a PNG or JPG signature image.</p>
              )}
              <Button type="button" size="sm" onClick={useUploadedSignature}>
                Use uploaded signature
              </Button>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSignatureDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

async function drawAnnotationsToPdfPage({
  annotations,
  page,
  font,
  outputDocument,
  imageCache,
}: {
  annotations: PdfAnnotation[]
  page: PDFPage
  font: PDFFont
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

      const lines = annotation.text.split("\n")
      const lineHeight = annotation.fontSize * 1.2
      lines.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: boxX + 4,
          y: boxY + boxHeight - (lineIndex + 1) * lineHeight,
          size: annotation.fontSize,
          font,
          color: toRgb(annotation.color),
          opacity: annotation.opacity,
        })
      })

      continue
    }

    if (annotation.type === "image") {
      let image = imageCache.get(annotation.src)
      if (!image) {
        const payload = await fetchImageBytesForPdf(annotation.src)
        image = payload.kind === "jpg"
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

function toRgb(color: string) {
  const normalized = color.replace("#", "")
  const hex = normalized.length === 3
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
  const response = await fetch(src)
  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

async function fetchImageBytesForPdf(src: string): Promise<{ kind: "png" | "jpg"; bytes: Uint8Array }> {
  const bytes = await fetchImageBytes(src)
  if (isLikelyJpeg(src, bytes)) {
    return {
      kind: "jpg",
      bytes,
    }
  }

  if (isLikelyPng(src, bytes)) {
    return {
      kind: "png",
      bytes,
    }
  }

  const image = await loadImageViaDom(src)
  const canvas = document.createElement("canvas")
  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height

  const context = canvas.getContext("2d")
  if (!context) {
    return {
      kind: "png",
      bytes,
    }
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/png")
  })

  if (!blob) {
    return {
      kind: "png",
      bytes,
    }
  }

  const pngBuffer = await blob.arrayBuffer()
  return {
    kind: "png",
    bytes: new Uint8Array(pngBuffer),
  }
}

function isLikelyJpeg(src: string, bytes: Uint8Array) {
  if (src.startsWith("data:image/jpeg") || src.startsWith("data:image/jpg")) {
    return true
  }
  return bytes[0] === 0xff && bytes[1] === 0xd8
}

function isLikelyPng(src: string, bytes: Uint8Array) {
  if (src.startsWith("data:image/png")) {
    return true
  }
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

function DraftAnnotation({ annotation }: { annotation: PdfAnnotation }) {
  if (annotation.type === "line" || annotation.type === "arrow") {
    const x1 = annotation.start.x * 100
    const y1 = annotation.start.y * 100
    const x2 = annotation.end.x * 100
    const y2 = annotation.end.y * 100

    return (
      <g opacity={annotation.opacity}>
        <line
          x1={`${x1}%`}
          y1={`${y1}%`}
          x2={`${x2}%`}
          y2={`${y2}%`}
          stroke={annotation.color}
          strokeWidth={annotation.strokeWidth}
          strokeLinecap="round"
          strokeDasharray="5 4"
        />
        {annotation.type === "arrow" ? (
          <ArrowHead startX={x1} startY={y1} endX={x2} endY={y2} color={annotation.color} dashed />
        ) : null}
      </g>
    )
  }

  if (annotation.type === "pen") {
    const points = annotation.points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x * 100},${point.y * 100}`).join(" ")

    return (
      <path
        d={points}
        fill="none"
        opacity={annotation.opacity}
        stroke={annotation.color}
        strokeWidth={annotation.strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray="4 2"
      />
    )
  }

  return (
    <rect
      x={`${annotation.x * 100}%`}
      y={`${annotation.y * 100}%`}
      width={`${annotation.width * 100}%`}
      height={`${annotation.height * 100}%`}
      rx={annotation.type === "ellipse" ? 999 : 0}
      ry={annotation.type === "ellipse" ? 999 : 0}
      fill={annotation.type === "highlight" ? annotation.color : "transparent"}
      fillOpacity={annotation.type === "highlight" ? annotation.opacity : 0}
      stroke={annotation.type === "highlight" ? "none" : annotation.color}
      strokeWidth={annotation.type === "highlight" ? 0 : annotation.strokeWidth}
      strokeDasharray="5 4"
    />
  )
}

function ArrowHead({
  startX,
  startY,
  endX,
  endY,
  color,
  dashed = false,
}: {
  startX: number
  startY: number
  endX: number
  endY: number
  color: string
  dashed?: boolean
}) {
  const angle = Math.atan2(endY - startY, endX - startX)
  const headLength = 2.1

  const leftX = endX - headLength * Math.cos(angle - Math.PI / 7)
  const leftY = endY - headLength * Math.sin(angle - Math.PI / 7)
  const rightX = endX - headLength * Math.cos(angle + Math.PI / 7)
  const rightY = endY - headLength * Math.sin(angle + Math.PI / 7)

  return (
    <polygon
      points={`${endX},${endY} ${leftX},${leftY} ${rightX},${rightY}`}
      fill={color}
      stroke={dashed ? color : "none"}
      strokeDasharray={dashed ? "3 2" : undefined}
    />
  )
}
