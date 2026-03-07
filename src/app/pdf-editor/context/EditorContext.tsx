"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { PDFDocument } from "pdf-lib"

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
  translateAnnotation,
} from "@/app/pdf-editor/lib/pdfStudio"
import { drawAnnotationsToPdfPage, embedStandardFonts } from "@/app/pdf-editor/lib/pdfExport"
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
  ResizeDirection,
} from "@/app/pdf-editor/lib/types"

// ─── Color Constants ────────────────────────────────────────────────
export const HIGHLIGHT_COLORS = ["#facc15", "#22c55e", "#fb7185"]
export const STROKE_COLORS = ["#111827", "#2563eb", "#ef4444", "#9333ea"]

// ─── Session Types ──────────────────────────────────────────────────
export type DragPreview = {
  annotationId: string
  deltaX: number
  deltaY: number
}

export type DragSession = {
  annotation: PdfAnnotation
  startX: number
  startY: number
}

export type PanSession = {
  clientX: number
  clientY: number
  scrollLeft: number
  scrollTop: number
}

export type DrawSession =
  | { mode: "shape"; tool: "highlight" | "rectangle" | "ellipse" | "line" | "arrow"; startX: number; startY: number }
  | { mode: "pen" }

export type ResizeSession = {
  annotationId: string
  pageId: string
  direction: ResizeDirection
  startPoint: { x: number; y: number }
  originalBounds: { x: number; y: number; width: number; height: number }
}

// ─── Context Type ───────────────────────────────────────────────────
export interface EditorContextValue {
  // State
  history: EditorHistory | null
  snapshot: EditorSnapshot | null
  sources: Record<string, PdfSourceRecord>
  selectedTool: StudioTool
  effectiveTool: StudioTool
  selectedAnnotationId: string | null
  highlightColor: string
  strokeColor: string
  fitMode: FitMode
  zoomPercent: number
  pendingAsset: PendingAsset | null
  isExporting: boolean
  isBuildingPreview: boolean
  previewFileUrl: string | null
  mobileSidebarOpen: boolean
  draftAnnotation: PdfAnnotation | null
  dragPreview: DragPreview | null
  inlineEditAnnotationId: string | null
  inlineEditValue: string
  pageJumpInput: string
  signatureDialogOpen: boolean
  signatureMode: "draw" | "type" | "upload"
  signatureText: string
  signatureUploadDataUrl: string | null
  isSpacePanning: boolean

  // Derived
  pages: EditorPage[]
  activePageIndex: number
  activePage: EditorPage | null

  // Refs
  uploadInputRef: React.RefObject<HTMLInputElement | null>
  insertPdfInputRef: React.RefObject<HTMLInputElement | null>
  imageInputRef: React.RefObject<HTMLInputElement | null>
  pageViewportRef: React.RefObject<HTMLDivElement | null>
  signatureCanvasRef: React.RefObject<HTMLCanvasElement | null>
  inlineEditRef: React.RefObject<HTMLTextAreaElement | null>
  drawSessionRef: React.MutableRefObject<DrawSession | null>
  dragSessionRef: React.MutableRefObject<DragSession | null>
  panSessionRef: React.MutableRefObject<PanSession | null>
  resizeSessionRef: React.MutableRefObject<ResizeSession | null>
  pageRefsMap: React.MutableRefObject<Map<string, HTMLDivElement>>

  // Page viewport
  pageViewportSize: { width: number; height: number }

  // Actions
  pushSnapshot: (updater: (draft: EditorSnapshot) => void) => void
  undo: () => void
  redo: () => void
  setTool: (tool: StudioTool) => void
  setActivePageById: (pageId: string) => void
  setActivePageWithoutHistory: (pageId: string) => void
  addAnnotation: (annotation: PdfAnnotation) => void
  updateAnnotation: (pageId: string, annotationId: string, updater: (a: PdfAnnotation) => PdfAnnotation) => void
  removeAnnotation: (pageId: string, annotationId: string) => void
  removeSelectedAnnotation: () => void
  setSelectedAnnotationId: (id: string | null) => void
  setHighlightColor: (color: string) => void
  setStrokeColor: (color: string) => void
  setFitMode: (mode: FitMode) => void
  setZoomPercent: React.Dispatch<React.SetStateAction<number>>
  setDraftAnnotation: (a: PdfAnnotation | null) => void
  setDragPreview: (preview: DragPreview | null) => void
  setMobileSidebarOpen: (open: boolean | ((v: boolean) => boolean)) => void
  setPendingAsset: (asset: PendingAsset | null) => void
  setInlineEditAnnotationId: (id: string | null) => void
  setInlineEditValue: (value: string) => void
  setPageJumpInput: (input: string) => void
  setSignatureDialogOpen: (open: boolean) => void
  setSignatureMode: (mode: "draw" | "type" | "upload") => void
  setSignatureText: (text: string) => void
  setSignatureUploadDataUrl: (url: string | null) => void
  setIsSpacePanning: (v: boolean) => void

  // Complex actions
  loadPrimaryFile: (file: File) => Promise<void>
  openFileDialog: () => void
  onUploadChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onInsertPdfChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onUploadImageAsset: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  rotatePage: (pageId: string) => void
  duplicatePage: (pageId: string) => void
  deletePage: (pageId: string) => void
  reorderPage: (fromIndex: number, toIndex: number) => void
  insertBlankPage: (index: number) => void
  triggerInsertPdf: (index: number) => void
  exportPdf: () => Promise<void>
  onPageJumpSubmit: () => void
  zoomIn: () => void
  zoomOut: () => void
  startInlineEdit: (annotationId: string, initialText: string) => void
  commitInlineEdit: () => void
  cancelInlineEdit: () => void
  commitSignatureAsset: (src: string, name: string) => void
  generateTypedSignatureDataUrl: () => string | null
  startSignatureDrawing: (event: React.PointerEvent<HTMLCanvasElement>) => void
  continueSignatureDrawing: (event: React.PointerEvent<HTMLCanvasElement>) => void
  endSignatureDrawing: (event: React.PointerEvent<HTMLCanvasElement>) => void
  clearSignatureCanvas: () => void
  useDrawnSignature: () => void
  useTypedSignature: () => void
  onSignatureUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  useUploadedSignature: () => void
  scrollToPage: (pageId: string) => void
  getAnnotationsForPage: (pageId: string) => PdfAnnotation[]
  getDisplayForPage: (page: EditorPage) => ReturnType<typeof getDisplayDimensions> | null
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function useEditorContext() {
  const context = useContext(EditorContext)
  if (!context) throw new Error("useEditorContext must be used within EditorProvider")
  return context
}

const THUMBNAIL_ROW_HEIGHT = 228

export function EditorProvider({ children }: { children: ReactNode }) {
  // ─── Refs ─────────────────────────────────────────────────────
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const insertPdfInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pageViewportRef = useRef<HTMLDivElement>(null)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const signatureDrawRef = useRef(false)
  const inlineEditRef = useRef<HTMLTextAreaElement>(null)
  const drawSessionRef = useRef<DrawSession | null>(null)
  const dragSessionRef = useRef<DragSession | null>(null)
  const panSessionRef = useRef<PanSession | null>(null)
  const resizeSessionRef = useRef<ResizeSession | null>(null)
  const previewFileUrlRef = useRef<string | null>(null)
  const stablePageStructureRef = useRef<EditorPage[]>([])
  const pageRefsMap = useRef<Map<string, HTMLDivElement>>(new Map())

  // ─── State ────────────────────────────────────────────────────
  const [history, setHistory] = useState<EditorHistory | null>(null)
  const [sources, setSources] = useState<Record<string, PdfSourceRecord>>({})
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null)
  const [isBuildingPreview, setIsBuildingPreview] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

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
  const [inlineEditAnnotationId, setInlineEditAnnotationId] = useState<string | null>(null)
  const [inlineEditValue, setInlineEditValue] = useState("")

  const [pageViewportSize, setPageViewportSize] = useState({ width: 1100, height: 900 })

  // ─── Derived ──────────────────────────────────────────────────
  const snapshot = history?.present ?? null
  const pages = useMemo(() => snapshot?.pages ?? [], [snapshot?.pages])
  const effectiveTool = isSpacePanning ? "hand" : selectedTool

  const activePageIndex = useMemo(() => {
    if (!snapshot?.activePageId) return 0
    const index = pages.findIndex((page) => page.id === snapshot.activePageId)
    return index >= 0 ? index : 0
  }, [pages, snapshot?.activePageId])

  const activePage = pages[activePageIndex] ?? null

  const structureFingerprint = useMemo(() => {
    if (!snapshot || snapshot.pages.length === 0) return ""
    return snapshot.pages
      .map((page) =>
        page.source.kind === "blank"
          ? `${page.id}:blank:${page.source.width}:${page.source.height}:${page.rotation}`
          : `${page.id}:${page.source.sourceId}:${page.source.sourcePageIndex}:${page.rotation}`,
      )
      .join("|")
  }, [snapshot])

  // ─── Effects ──────────────────────────────────────────────────
  useEffect(() => {
    previewFileUrlRef.current = previewFileUrl
  }, [previewFileUrl])

  useEffect(() => {
    return () => {
      if (previewFileUrlRef.current) URL.revokeObjectURL(previewFileUrlRef.current)
    }
  }, [])

  useEffect(() => {
    if (!snapshot) return
    setPageJumpInput(String(activePageIndex + 1))
  }, [activePageIndex, snapshot])

  useEffect(() => {
    if (inlineEditAnnotationId && inlineEditRef.current) {
      const el = inlineEditRef.current
      el.focus()
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [inlineEditAnnotationId])

  useEffect(() => {
    const viewport = pageViewportRef.current
    if (!viewport) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setPageViewportSize({ width: entry.contentRect.width, height: entry.contentRect.height })
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
      setPreviewFileUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
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

        setPreviewFileUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return nextPreviewUrl
        })
      } catch (error) {
        console.error(error)
        toast.error("Could not render the PDF preview")
      } finally {
        if (!cancelled) setIsBuildingPreview(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [sources, structureFingerprint])

  // ─── Snapshot management ──────────────────────────────────────
  const normalizeSnapshot = useCallback((draft: EditorSnapshot): EditorSnapshot => {
    draft.annotationsByPageId = ensureAnnotations(draft.annotationsByPageId, draft.pages)
    if (draft.pages.length === 0) {
      draft.activePageId = null
      return draft
    }
    const hasActive = draft.activePageId && draft.pages.some((page) => page.id === draft.activePageId)
    if (!hasActive) draft.activePageId = draft.pages[0].id
    return draft
  }, [])

  const pushSnapshot = useCallback(
    (updater: (draft: EditorSnapshot) => void) => {
      setHistory((prev) => {
        if (!prev) return prev
        const draft = cloneSnapshot(prev.present)
        updater(draft)
        const nextPresent = normalizeSnapshot(draft)
        return { past: [...prev.past, prev.present].slice(-120), present: nextPresent, future: [] }
      })
    },
    [normalizeSnapshot],
  )

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (!prev || prev.past.length === 0) return prev
      const newPast = prev.past.slice(0, -1)
      const restored = prev.past[prev.past.length - 1]
      return { past: newPast, present: restored, future: [prev.present, ...prev.future] }
    })
    setSelectedAnnotationId(null)
  }, [])

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (!prev || prev.future.length === 0) return prev
      const [restored, ...remainingFuture] = prev.future
      return { past: [...prev.past, prev.present], present: restored, future: remainingFuture }
    })
    setSelectedAnnotationId(null)
  }, [])

  // ─── File operations ──────────────────────────────────────────
  const loadPrimaryFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported")
      return
    }
    try {
      const sourceId = createId("source")
      const source = await loadPdfSourceFromFile(file, sourceId)
      const initialSnapshot = createInitialSnapshot(source)
      setSources({ [source.id]: source })
      setHistory({ past: [], present: initialSnapshot, future: [] })
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
      if (file) await loadPrimaryFile(file)
      event.target.value = ""
    },
    [loadPrimaryFile],
  )

  const openFileDialog = useCallback(() => {
    uploadInputRef.current?.click()
  }, [])

  // ─── Page operations ──────────────────────────────────────────
  const setActivePageWithoutHistory = useCallback((pageId: string) => {
    setHistory((prev) => {
      if (!prev || prev.present.activePageId === pageId) return prev
      return { ...prev, present: { ...prev.present, activePageId: pageId } }
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
        if (!page) return
        page.rotation = ((page.rotation + 90) % 360) as 0 | 90 | 180 | 270
      })
    },
    [pushSnapshot],
  )

  const duplicatePage = useCallback(
    (pageId: string) => {
      pushSnapshot((draft) => {
        const index = draft.pages.findIndex((item) => item.id === pageId)
        if (index < 0) return
        const page = draft.pages[index]
        const clonedPage: EditorPage = { ...page, id: createId("page"), source: { ...page.source } }
        draft.pages.splice(index + 1, 0, clonedPage)
        const pageAnnotations = draft.annotationsByPageId[pageId] ?? []
        draft.annotationsByPageId[clonedPage.id] = pageAnnotations.map((a: PdfAnnotation) =>
          duplicateAnnotation(a, clonedPage.id),
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
        if (index < 0) return
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
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return
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
          source: { kind: "blank", width: DEFAULT_BLANK_PAGE.width, height: DEFAULT_BLANK_PAGE.height },
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
      if (!file) return
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files can be inserted")
        return
      }
      try {
        const sourceId = createId("source")
        const source = await loadPdfSourceFromFile(file, sourceId)
        const insertedPages = createPagesFromSource(source)
        setSources((prev) => ({ ...prev, [source.id]: source }))
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

  // ─── Annotation operations ────────────────────────────────────
  const updateAnnotation = useCallback(
    (pageId: string, annotationId: string, updater: (annotation: PdfAnnotation) => PdfAnnotation) => {
      pushSnapshot((draft) => {
        const annotations = draft.annotationsByPageId[pageId] ?? []
        const index = annotations.findIndex((a) => a.id === annotationId)
        if (index < 0) return
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

  const removeAnnotation = useCallback(
    (pageId: string, annotationId: string) => {
      pushSnapshot((draft) => {
        const list = draft.annotationsByPageId[pageId] ?? []
        draft.annotationsByPageId[pageId] = list.filter((a) => a.id !== annotationId)
      })
      if (selectedAnnotationId === annotationId) setSelectedAnnotationId(null)
    },
    [pushSnapshot, selectedAnnotationId],
  )

  const removeSelectedAnnotation = useCallback(() => {
    if (!activePage || !selectedAnnotationId) return
    pushSnapshot((draft) => {
      const list = draft.annotationsByPageId[activePage.id] ?? []
      draft.annotationsByPageId[activePage.id] = list.filter((a) => a.id !== selectedAnnotationId)
    })
    setSelectedAnnotationId(null)
  }, [activePage, pushSnapshot, selectedAnnotationId])

  // ─── Tool ─────────────────────────────────────────────────────
  const setTool = useCallback((tool: StudioTool) => {
    setSelectedTool(tool)
    if (tool !== "image" && tool !== "signature") setPendingAsset(null)
  }, [])

  // ─── Image asset ──────────────────────────────────────────────
  const onUploadImageAsset = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ""
      if (!file) return
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed")
        return
      }
      const src = URL.createObjectURL(file)
      setPendingAsset({ type: "image", src, width: 0.28, height: 0.2, name: file.name })
      setTool("image")
      toast.success("Click on the page to place the image")
    },
    [setTool],
  )

  // ─── Signature ────────────────────────────────────────────────
  const commitSignatureAsset = useCallback(
    (src: string, name: string) => {
      setPendingAsset({ type: "signature", src, width: 0.24, height: 0.12, name })
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
    if (!context) return null
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "#111827"
    context.font = "bold 96px cursive"
    context.textBaseline = "middle"
    context.fillText(signatureText.trim() || "Signature", 12, canvas.height / 2)
    return canvas.toDataURL("image/png")
  }, [signatureText])

  const startSignatureDrawing = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
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
    if (!signatureDrawRef.current) return
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)
    context.lineTo(x, y)
    context.stroke()
  }, [])

  const endSignatureDrawing = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    signatureDrawRef.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])

  const clearSignatureCanvas = useCallback(() => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  const useDrawnSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    commitSignatureAsset(canvas.toDataURL("image/png"), "drawn-signature")
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
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === "string") setSignatureUploadDataUrl(result)
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

  // ─── Inline editing ───────────────────────────────────────────
  const startInlineEdit = useCallback((annotationId: string, initialText: string) => {
    setInlineEditAnnotationId(annotationId)
    setInlineEditValue(initialText)
    setSelectedAnnotationId(annotationId)
  }, [])

  const commitInlineEdit = useCallback(() => {
    if (!inlineEditAnnotationId || !activePage) {
      setInlineEditAnnotationId(null)
      setInlineEditValue("")
      return
    }
    const trimmed = inlineEditValue.trim()
    if (!trimmed) {
      pushSnapshot((draft) => {
        const list = draft.annotationsByPageId[activePage.id] ?? []
        draft.annotationsByPageId[activePage.id] = list.filter((a) => a.id !== inlineEditAnnotationId)
      })
      setSelectedAnnotationId(null)
    } else {
      updateAnnotation(activePage.id, inlineEditAnnotationId, (a) => ({ ...a, text: trimmed }) as PdfAnnotation)
    }
    setInlineEditAnnotationId(null)
    setInlineEditValue("")
  }, [inlineEditAnnotationId, inlineEditValue, activePage, updateAnnotation, pushSnapshot])

  const cancelInlineEdit = useCallback(() => {
    if (!inlineEditAnnotationId || !activePage) {
      setInlineEditAnnotationId(null)
      setInlineEditValue("")
      return
    }
    const annotation = (snapshot?.annotationsByPageId[activePage.id] ?? []).find(
      (a) => a.id === inlineEditAnnotationId,
    ) as TextAnnotation | undefined
    if (annotation && !annotation.text) {
      pushSnapshot((draft) => {
        const list = draft.annotationsByPageId[activePage.id] ?? []
        draft.annotationsByPageId[activePage.id] = list.filter((a) => a.id !== inlineEditAnnotationId)
      })
      setSelectedAnnotationId(null)
    }
    setInlineEditAnnotationId(null)
    setInlineEditValue("")
  }, [inlineEditAnnotationId, activePage, snapshot, pushSnapshot])

  // ─── Export ───────────────────────────────────────────────────
  const exportPdf = useCallback(async () => {
    if (!snapshot || Object.keys(sources).length === 0) return
    setIsExporting(true)
    try {
      const structuredBytes = await buildStructuredPdfBytes(snapshot.pages, sources)
      const outputDocument = await PDFDocument.load(structuredBytes)
      const { font, boldFont, italicFont, boldItalicFont } = await embedStandardFonts(outputDocument)
      const imageCache = new Map<string, import("pdf-lib").PDFImage>()

      for (let pageIndex = 0; pageIndex < outputDocument.getPageCount(); pageIndex += 1) {
        const page = outputDocument.getPage(pageIndex)
        const pageId = snapshot.pages[pageIndex].id
        const annotations = snapshot.annotationsByPageId[pageId] ?? []
        await drawAnnotationsToPdfPage({
          annotations,
          page,
          font,
          boldFont,
          italicFont,
          boldItalicFont,
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

  // ─── Navigation ───────────────────────────────────────────────
  const onPageJumpSubmit = useCallback(() => {
    if (!snapshot) return
    const parsed = Number(pageJumpInput)
    if (!Number.isFinite(parsed)) {
      setPageJumpInput(String(activePageIndex + 1))
      return
    }
    const targetIndex = clamp(Math.floor(parsed) - 1, 0, snapshot.pages.length - 1)
    const targetPage = snapshot.pages[targetIndex]
    if (!targetPage) return
    setActivePageWithoutHistory(targetPage.id)
    // Scroll to page in multi-page view
    const el = pageRefsMap.current.get(targetPage.id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [activePageIndex, pageJumpInput, setActivePageWithoutHistory, snapshot])

  const zoomIn = useCallback(() => {
    setFitMode("none")
    setZoomPercent((v) => clamp(v + 10, 40, 400))
  }, [])

  const zoomOut = useCallback(() => {
    setFitMode("none")
    setZoomPercent((v) => clamp(v - 10, 40, 400))
  }, [])

  const scrollToPage = useCallback(
    (pageId: string) => {
      setActivePageWithoutHistory(pageId)
      const el = pageRefsMap.current.get(pageId)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
    },
    [setActivePageWithoutHistory],
  )

  // ─── Keyboard Shortcuts ───────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!snapshot) return
      const activeTag = (document.activeElement as HTMLElement | null)?.tagName
      const isTypingInField = activeTag === "INPUT" || activeTag === "TEXTAREA"

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
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

      if (isTypingInField) return

      if ((event.metaKey || event.ctrlKey) && (event.key === "=" || event.key === "+")) {
        event.preventDefault()
        setFitMode("none")
        setZoomPercent((v) => clamp(v + 10, 40, 400))
        return
      }

      if ((event.metaKey || event.ctrlKey) && (event.key === "-" || event.key === "_")) {
        event.preventDefault()
        setFitMode("none")
        setZoomPercent((v) => clamp(v - 10, 40, 400))
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
        setZoomPercent((v) => clamp(v + 10, 40, 400))
        return
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault()
        setFitMode("none")
        setZoomPercent((v) => clamp(v - 10, 40, 400))
        return
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedAnnotationId) {
        event.preventDefault()
        removeSelectedAnnotation()
        return
      }

      // Page navigation
      if (event.key === "PageDown") {
        event.preventDefault()
        const nextIndex = Math.min(activePageIndex + 1, pages.length - 1)
        const nextPage = pages[nextIndex]
        if (nextPage) scrollToPage(nextPage.id)
        return
      }

      if (event.key === "PageUp") {
        event.preventDefault()
        const prevIndex = Math.max(activePageIndex - 1, 0)
        const prevPage = pages[prevIndex]
        if (prevPage) scrollToPage(prevPage.id)
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") setIsSpacePanning(false)
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [activePageIndex, isSpacePanning, pages, redo, removeSelectedAnnotation, scrollToPage, selectedAnnotationId, snapshot, undo])

  // ─── Helpers ──────────────────────────────────────────────────
  const getAnnotationsForPage = useCallback(
    (pageId: string) => {
      return snapshot?.annotationsByPageId[pageId] ?? []
    },
    [snapshot],
  )

  const getDisplayForPage = useCallback(
    (page: EditorPage) => {
      return getDisplayDimensions(page, sources, fitMode, pageViewportSize.width, pageViewportSize.height, zoomPercent)
    },
    [sources, fitMode, pageViewportSize.width, pageViewportSize.height, zoomPercent],
  )

  // ─── Context value ────────────────────────────────────────────
  const value = useMemo<EditorContextValue>(
    () => ({
      history,
      snapshot,
      sources,
      selectedTool,
      effectiveTool,
      selectedAnnotationId,
      highlightColor,
      strokeColor,
      fitMode,
      zoomPercent,
      pendingAsset,
      isExporting,
      isBuildingPreview,
      previewFileUrl,
      mobileSidebarOpen,
      draftAnnotation,
      dragPreview,
      inlineEditAnnotationId,
      inlineEditValue,
      pageJumpInput,
      signatureDialogOpen,
      signatureMode,
      signatureText,
      signatureUploadDataUrl,
      isSpacePanning,
      pages,
      activePageIndex,
      activePage,
      uploadInputRef,
      insertPdfInputRef,
      imageInputRef,
      pageViewportRef,
      signatureCanvasRef,
      inlineEditRef,
      drawSessionRef,
      dragSessionRef,
      panSessionRef,
      resizeSessionRef,
      pageRefsMap,
      pageViewportSize,
      pushSnapshot,
      undo,
      redo,
      setTool,
      setActivePageById,
      setActivePageWithoutHistory,
      addAnnotation,
      updateAnnotation,
      removeAnnotation,
      removeSelectedAnnotation,
      setSelectedAnnotationId,
      setHighlightColor,
      setStrokeColor,
      setFitMode,
      setZoomPercent,
      setDraftAnnotation,
      setDragPreview,
      setMobileSidebarOpen,
      setPendingAsset,
      setInlineEditAnnotationId,
      setInlineEditValue,
      setPageJumpInput,
      setSignatureDialogOpen,
      setSignatureMode,
      setSignatureText,
      setSignatureUploadDataUrl,
      setIsSpacePanning,
      loadPrimaryFile,
      openFileDialog,
      onUploadChange,
      onInsertPdfChange,
      onUploadImageAsset,
      rotatePage,
      duplicatePage,
      deletePage,
      reorderPage,
      insertBlankPage,
      triggerInsertPdf,
      exportPdf,
      onPageJumpSubmit,
      zoomIn,
      zoomOut,
      startInlineEdit,
      commitInlineEdit,
      cancelInlineEdit,
      commitSignatureAsset,
      generateTypedSignatureDataUrl,
      startSignatureDrawing,
      continueSignatureDrawing,
      endSignatureDrawing,
      clearSignatureCanvas,
      useDrawnSignature,
      useTypedSignature,
      onSignatureUpload,
      useUploadedSignature,
      scrollToPage,
      getAnnotationsForPage,
      getDisplayForPage,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      history, snapshot, sources, selectedTool, effectiveTool, selectedAnnotationId,
      highlightColor, strokeColor, fitMode, zoomPercent, pendingAsset, isExporting,
      isBuildingPreview, previewFileUrl, mobileSidebarOpen, draftAnnotation, dragPreview,
      inlineEditAnnotationId, inlineEditValue, pageJumpInput, signatureDialogOpen,
      signatureMode, signatureText, signatureUploadDataUrl, isSpacePanning,
      pages, activePageIndex, activePage, pageViewportSize,
      pushSnapshot, undo, redo, setTool, setActivePageById, setActivePageWithoutHistory,
      addAnnotation, updateAnnotation, removeAnnotation, removeSelectedAnnotation,
      loadPrimaryFile, onUploadChange, openFileDialog, onInsertPdfChange, onUploadImageAsset,
      rotatePage, duplicatePage, deletePage, reorderPage, insertBlankPage, triggerInsertPdf,
      exportPdf, onPageJumpSubmit, zoomIn, zoomOut,
      startInlineEdit, commitInlineEdit, cancelInlineEdit,
      commitSignatureAsset, generateTypedSignatureDataUrl,
      startSignatureDrawing, continueSignatureDrawing, endSignatureDrawing,
      clearSignatureCanvas, useDrawnSignature, useTypedSignature,
      onSignatureUpload, useUploadedSignature, scrollToPage,
      getAnnotationsForPage, getDisplayForPage,
    ],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}
