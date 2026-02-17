"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { DropResult } from "@hello-pangea/dnd"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import {
    Check,
    Download,
    GripVertical,
    ImagePlus,
    Loader2,
    Palette,
    RectangleHorizontal,
    RectangleVertical,
    RotateCw,
    Settings2,
    Trash2,
} from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { PdfPagePreview } from "@/components/pdf/PdfPagePreview"
import { PdfPreviewDialog } from "@/components/pdf/PdfPreviewDialog"

type PagePreset = "A4" | "Letter" | "Legal" | "Tabloid" | "A3" | "A5" | "Custom"
type CustomUnit = "mm" | "cm" | "in"
type Orientation = "portrait" | "landscape"
type MarginPreset = "none" | "small" | "standard"
type LayoutMode = "fit" | "fill" | "original"

interface PageSettings {
    pagePreset: PagePreset
    customWidth: number
    customHeight: number
    customUnit: CustomUnit
    orientation: Orientation
    backgroundColor: string
    marginPreset: MarginPreset
    layoutMode: LayoutMode
}

interface UploadedImage {
    id: string
    file: File
    name: string
    size: number
    previewUrl: string
    width: number
    height: number
    rotation: 0 | 90 | 180 | 270
}

type PdfReadyImage = {
    bytes: Uint8Array
    mime: "image/png" | "image/jpeg"
    width: number
    height: number
}

const SETTINGS_STORAGE_KEY = "image-pdf-settings-v1"
const DEFAULT_FILENAME = "image-document"

const PAGE_SIZES_MM: Record<Exclude<PagePreset, "Custom">, { width: number; height: number }> = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
    Tabloid: { width: 279, height: 432 },
    A3: { width: 297, height: 420 },
    A5: { width: 148, height: 210 },
}

const MARGIN_MM: Record<MarginPreset, number> = {
    none: 0,
    small: 5,
    standard: 12,
}

const COLOR_SWATCHES = [
    { name: "White", value: "#FFFFFF" },
    { name: "Black", value: "#101418" },
    { name: "Gray", value: "#E5E7EB" },
] as const

const PAGE_PRESET_OPTIONS: PagePreset[] = ["A4", "Letter", "Legal", "Tabloid", "A3", "A5", "Custom"]

const DEFAULT_SETTINGS: PageSettings = {
    pagePreset: "A4",
    customWidth: 210,
    customHeight: 297,
    customUnit: "mm",
    orientation: "portrait",
    backgroundColor: "#FFFFFF",
    marginPreset: "standard",
    layoutMode: "fit",
}

const createId = () => Math.random().toString(36).slice(2, 11)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const unitToMm = (value: number, unit: CustomUnit) => {
    if (unit === "cm") return value * 10
    if (unit === "in") return value * 25.4
    return value
}

const mmToPt = (mm: number) => (mm * 72) / 25.4

const getPageSizeMm = (settings: PageSettings) => {
    let widthMm: number
    let heightMm: number

    if (settings.pagePreset === "Custom") {
        widthMm = unitToMm(settings.customWidth, settings.customUnit)
        heightMm = unitToMm(settings.customHeight, settings.customUnit)
    } else {
        const preset = PAGE_SIZES_MM[settings.pagePreset]
        widthMm = preset.width
        heightMm = preset.height
    }

    if (settings.orientation === "landscape") {
        return { widthMm: heightMm, heightMm: widthMm }
    }
    return { widthMm, heightMm }
}

const getPageSizePt = (settings: PageSettings) => {
    const { widthMm, heightMm } = getPageSizeMm(settings)
    return {
        widthPt: mmToPt(widthMm),
        heightPt: mmToPt(heightMm),
    }
}

const getMarginPt = (settings: PageSettings) => mmToPt(MARGIN_MM[settings.marginPreset])

const loadSettings = (): PageSettings => {
    if (typeof window === "undefined") {
        return DEFAULT_SETTINGS
    }
    try {
        const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
        if (!raw) return DEFAULT_SETTINGS
        const parsed = JSON.parse(raw) as Partial<PageSettings>
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            customWidth: Number(parsed.customWidth ?? DEFAULT_SETTINGS.customWidth),
            customHeight: Number(parsed.customHeight ?? DEFAULT_SETTINGS.customHeight),
        }
    } catch {
        return DEFAULT_SETTINGS
    }
}

const readImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const image = new Image()
        image.onload = () => {
            resolve({ width: image.naturalWidth, height: image.naturalHeight })
            URL.revokeObjectURL(url)
        }
        image.onerror = () => {
            reject(new Error(`Failed to read image dimensions: ${file.name}`))
            URL.revokeObjectURL(url)
        }
        image.src = url
    })

const loadImageElement = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error("Failed to load image"))
        image.src = url
    })

const toNormalizedRgb = (hex: string) => {
    const cleaned = hex.trim().replace("#", "")
    const normalized = cleaned.length === 3 ? cleaned.split("").map((char) => char + char).join("") : cleaned
    const safe = normalized.padEnd(6, "0").slice(0, 6)
    const r = parseInt(safe.slice(0, 2), 16) / 255
    const g = parseInt(safe.slice(2, 4), 16) / 255
    const b = parseInt(safe.slice(4, 6), 16) / 255
    return { r, g, b }
}

const normalizeImageForPdf = async (image: UploadedImage): Promise<PdfReadyImage> => {
    const isJpeg = /image\/jpe?g/i.test(image.file.type)
    const isPng = /image\/png/i.test(image.file.type)

    if (image.rotation === 0 && (isJpeg || isPng)) {
        const bytes = new Uint8Array(await image.file.arrayBuffer())
        return {
            bytes,
            mime: isPng ? "image/png" : "image/jpeg",
            width: image.width,
            height: image.height,
        }
    }

    const url = URL.createObjectURL(image.file)
    try {
        const source = await loadImageElement(url)
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        if (!context) {
            throw new Error("Canvas context unavailable")
        }

        if (image.rotation === 90 || image.rotation === 270) {
            canvas.width = source.naturalHeight
            canvas.height = source.naturalWidth
        } else {
            canvas.width = source.naturalWidth
            canvas.height = source.naturalHeight
        }

        if (image.rotation === 90) {
            context.translate(canvas.width, 0)
            context.rotate(Math.PI / 2)
        } else if (image.rotation === 180) {
            context.translate(canvas.width, canvas.height)
            context.rotate(Math.PI)
        } else if (image.rotation === 270) {
            context.translate(0, canvas.height)
            context.rotate(-Math.PI / 2)
        }

        context.drawImage(source, 0, 0)

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (nextBlob) => {
                    if (!nextBlob) {
                        reject(new Error("Failed to convert image"))
                        return
                    }
                    resolve(nextBlob)
                },
                "image/png",
                1,
            )
        })

        const bytes = new Uint8Array(await blob.arrayBuffer())
        return {
            bytes,
            mime: "image/png",
            width: canvas.width,
            height: canvas.height,
        }
    } finally {
        URL.revokeObjectURL(url)
    }
}

const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const kilo = 1024
    const units = ["B", "KB", "MB", "GB"]
    const index = Math.floor(Math.log(bytes) / Math.log(kilo))
    return `${(bytes / Math.pow(kilo, index)).toFixed(2)} ${units[index]}`
}

const timestamp = () => {
    const now = new Date()
    const pad = (value: number) => String(value).padStart(2, "0")
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

export default function ImagePdfPage() {
    const [images, setImages] = useState<UploadedImage[]>([])
    const [settings, setSettings] = useState<PageSettings>(loadSettings)
    const [activeImageId, setActiveImageId] = useState<string | null>(null)
    const [filename, setFilename] = useState(DEFAULT_FILENAME)
    const [isDragging, setIsDragging] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewPdfUrl, setPreviewPdfUrl] = useState("")

    const fileInputRef = useRef<HTMLInputElement>(null)
    const objectUrlsRef = useRef<Set<string>>(new Set())

    const activeImage = images.find((item) => item.id === activeImageId) ?? images[0]
    const { widthPt, heightPt } = useMemo(() => getPageSizePt(settings), [settings])
    const marginPt = useMemo(() => getMarginPt(settings), [settings])

    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
        } catch {
            // ignore persistence failure
        }
    }, [settings])

    useEffect(() => {
        const trackedObjectUrls = objectUrlsRef.current
        const currentPreviewUrl = previewPdfUrl
        return () => {
            trackedObjectUrls.forEach((url) => URL.revokeObjectURL(url))
            trackedObjectUrls.clear()
            if (currentPreviewUrl) {
                URL.revokeObjectURL(currentPreviewUrl)
            }
        }
    }, [previewPdfUrl])

    const updateSettings = <K extends keyof PageSettings>(key: K, value: PageSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }))
    }

    const openFileDialog = () => fileInputRef.current?.click()

    const addImages = useCallback(
        async (incomingFiles: File[]) => {
            const imageFiles = incomingFiles.filter((file) => file.type.startsWith("image/"))
            if (imageFiles.length === 0) {
                setError("Please upload image files (JPG, PNG, WEBP, etc).")
                return
            }
            setError(null)

            try {
                const nextImages = await Promise.all(
                    imageFiles.map(async (file) => {
                        const dimensions = await readImageDimensions(file)
                        const previewUrl = URL.createObjectURL(file)
                        objectUrlsRef.current.add(previewUrl)
                        return {
                            id: createId(),
                            file,
                            name: file.name,
                            size: file.size,
                            previewUrl,
                            width: dimensions.width,
                            height: dimensions.height,
                            rotation: 0 as const,
                        }
                    }),
                )

                const shouldOpenSetup = images.length === 0 && nextImages.length > 0
                setImages((prev) => [...prev, ...nextImages])
                setActiveImageId((prev) => prev ?? nextImages[0]?.id ?? null)
                if (shouldOpenSetup) {
                    setIsSettingsOpen(true)
                }
            } catch {
                setError("Some images could not be processed. Please try again.")
            }
        },
        [images.length],
    )

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextFiles = Array.from(event.target.files || [])
        void addImages(nextFiles)
        event.target.value = ""
    }

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault()
        setIsDragging(false)
        const dropped = Array.from(event.dataTransfer.files || [])
        void addImages(dropped)
    }

    const removeImage = (id: string) => {
        const target = images.find((item) => item.id === id)
        if (!target) {
            return
        }
        URL.revokeObjectURL(target.previewUrl)
        objectUrlsRef.current.delete(target.previewUrl)

        const next = images.filter((item) => item.id !== id)
        setImages(next)
        if (activeImageId === id) {
            setActiveImageId(next[0]?.id ?? null)
        }
    }

    const rotateImage = (id: string) => {
        setImages((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, rotation: (((item.rotation + 90) % 360) as 0 | 90 | 180 | 270) } : item,
            ),
        )
    }

    const resetAll = () => {
        images.forEach((image) => {
            URL.revokeObjectURL(image.previewUrl)
            objectUrlsRef.current.delete(image.previewUrl)
        })
        setImages([])
        setActiveImageId(null)
        setError(null)
        setPreviewOpen(false)
        if (previewPdfUrl) {
            URL.revokeObjectURL(previewPdfUrl)
            setPreviewPdfUrl("")
        }
    }

    const handleSortEnd = (result: DropResult) => {
        if (!result.destination || result.destination.index === result.source.index) {
            return
        }

        const reordered = Array.from(images)
        const [moved] = reordered.splice(result.source.index, 1)
        if (!moved) return
        reordered.splice(result.destination.index, 0, moved)
        setImages(reordered)
    }

    const buildPdfBlob = useCallback(async () => {
        if (images.length === 0) {
            setError("Please upload at least one image.")
            return null
        }

        const { PDFDocument, rgb } = await import("pdf-lib")
        const pdf = await PDFDocument.create()
        const pageSize = getPageSizePt(settings)
        const margin = getMarginPt(settings)
        const contentWidth = Math.max(1, pageSize.widthPt - margin * 2)
        const contentHeight = Math.max(1, pageSize.heightPt - margin * 2)
        const color = toNormalizedRgb(settings.backgroundColor)

        for (const image of images) {
            const normalized = await normalizeImageForPdf(image)

            const embedded =
                normalized.mime === "image/png"
                    ? await pdf.embedPng(normalized.bytes)
                    : await pdf.embedJpg(normalized.bytes)

            const imageWidth = normalized.width
            const imageHeight = normalized.height

            let scale = 1
            if (settings.layoutMode === "fit") {
                scale = Math.min(contentWidth / imageWidth, contentHeight / imageHeight)
            } else if (settings.layoutMode === "fill") {
                scale = Math.max(contentWidth / imageWidth, contentHeight / imageHeight)
            } else {
                scale = 72 / 96
            }

            const drawWidth = Math.max(1, imageWidth * scale)
            const drawHeight = Math.max(1, imageHeight * scale)
            const x = margin + (contentWidth - drawWidth) / 2
            const y = margin + (contentHeight - drawHeight) / 2

            const page = pdf.addPage([pageSize.widthPt, pageSize.heightPt])
            page.drawRectangle({
                x: 0,
                y: 0,
                width: pageSize.widthPt,
                height: pageSize.heightPt,
                color: rgb(color.r, color.g, color.b),
            })
            page.drawImage(embedded, { x, y, width: drawWidth, height: drawHeight })
        }

        const pdfBytes = await pdf.save()
        return new Blob([pdfBytes], { type: "application/pdf" })
    }, [images, settings])

    const createAndHandlePdf = async (mode: "preview" | "download") => {
        setIsProcessing(true)
        setError(null)
        try {
            const blob = await buildPdfBlob()
            if (!blob) return

            if (mode === "preview") {
                if (previewPdfUrl) {
                    URL.revokeObjectURL(previewPdfUrl)
                }
                const nextUrl = URL.createObjectURL(blob)
                setPreviewPdfUrl(nextUrl)
                setPreviewOpen(true)
                return
            }

            const url = URL.createObjectURL(blob)
            const anchor = document.createElement("a")
            const safeName = (filename.trim() || DEFAULT_FILENAME).replace(/\.pdf$/i, "")
            anchor.href = url
            anchor.download = `${safeName}-${timestamp()}.pdf`
            document.body.appendChild(anchor)
            anchor.click()
            document.body.removeChild(anchor)
            URL.revokeObjectURL(url)
        } catch (buildError) {
            console.error(buildError)
            setError("Failed to create PDF. Please check your images and try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    const closePreview = (open: boolean) => {
        setPreviewOpen(open)
        if (!open && previewPdfUrl) {
            URL.revokeObjectURL(previewPdfUrl)
            setPreviewPdfUrl("")
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-6 sm:py-10">
                <section className="mx-auto max-w-6xl space-y-6">
                    <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
                        <CardHeader className="space-y-3">
                            <Badge className="w-fit border-primary/20 bg-primary/10 text-primary">Smart Image to PDF Converter</Badge>
                            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Convert images to one clean PDF
                            </CardTitle>
                            <CardDescription className="max-w-3xl text-sm leading-relaxed sm:text-base">
                                Upload one or many images, choose page size (A4 by default), background color, margin, and layout, then
                                export a professional PDF in your browser.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                onClick={openFileDialog}
                                onDragOver={(event) => {
                                    event.preventDefault()
                                    setIsDragging(true)
                                }}
                                onDragLeave={(event) => {
                                    event.preventDefault()
                                    setIsDragging(false)
                                }}
                                onDrop={handleDrop}
                                className={cn(
                                    "cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-8",
                                    isDragging
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-surface/45 hover:border-primary/40 hover:bg-accent/40",
                                )}
                            >
                                <div className="mx-auto flex w-fit items-center justify-center rounded-full border border-border/80 bg-card p-3">
                                    <ImagePlus className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="mt-4 text-xl font-semibold text-foreground">Drop images here</h2>
                                <p className="mt-1 text-sm text-muted-foreground">or click to browse JPG, PNG, WEBP and more</p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleInputChange}
                            />

                            <div className="mt-5 flex flex-wrap items-center gap-2.5">
                                <Button variant="outline" size="sm" className="h-9 rounded-md" onClick={openFileDialog}>
                                    Add images
                                </Button>
                                <Button variant="outline" size="sm" className="h-9 rounded-md" onClick={() => setIsSettingsOpen(true)}>
                                    <Settings2 className="h-4 w-4" />
                                    Page setup
                                </Button>
                                <p className="text-xs text-muted-foreground">Default setup: A4, white background, standard margin.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Something went wrong</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {images.length > 0 && (
                        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                            <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <CardTitle className="text-xl font-semibold tracking-tight">Organize images ({images.length})</CardTitle>
                                        <p className="text-xs text-muted-foreground">Drag to reorder, rotate if needed</p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <DragDropContext onDragEnd={handleSortEnd}>
                                        <Droppable droppableId="image-pdf-list">
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2.5">
                                                    {images.map((image, index) => (
                                                        <Draggable key={image.id} draggableId={image.id} index={index}>
                                                            {(draggableProvided, snapshot) => (
                                                                <article
                                                                    ref={draggableProvided.innerRef}
                                                                    {...draggableProvided.draggableProps}
                                                                    className={cn(
                                                                        "rounded-xl border border-border/80 bg-background p-2.5 transition-colors",
                                                                        activeImage?.id === image.id && "border-primary/50 bg-primary/5",
                                                                        snapshot.isDragging && "ring-2 ring-primary/25",
                                                                    )}
                                                                    onClick={() => setActiveImageId(image.id)}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <button
                                                                            type="button"
                                                                            {...draggableProvided.dragHandleProps}
                                                                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
                                                                            aria-label={`Reorder ${image.name}`}
                                                                        >
                                                                            <GripVertical className="h-4 w-4" />
                                                                        </button>
                                                                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-border/80 bg-surface px-2 text-xs font-semibold">
                                                                            {index + 1}
                                                                        </span>

                                                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border/70 bg-surface">
                                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                            <img
                                                                                src={image.previewUrl}
                                                                                alt={image.name}
                                                                                className="h-full w-full object-cover"
                                                                                style={{ transform: `rotate(${image.rotation}deg)` }}
                                                                            />
                                                                        </div>

                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="truncate text-sm font-medium text-foreground" title={image.name}>
                                                                                {image.name}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {image.width}×{image.height} • {formatSize(image.size)}
                                                                            </p>
                                                                        </div>

                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation()
                                                                                rotateImage(image.id)
                                                                            }}
                                                                        >
                                                                            <RotateCw className="h-4 w-4" />
                                                                            <span className="sr-only">Rotate image</span>
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 rounded-md text-muted-foreground hover:text-danger"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation()
                                                                                removeImage(image.id)
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                            <span className="sr-only">Remove image</span>
                                                                        </Button>
                                                                    </div>
                                                                </article>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <PdfPagePreview
                                    imageUrl={activeImage?.previewUrl}
                                    imageWidth={activeImage?.width}
                                    imageHeight={activeImage?.height}
                                    rotation={activeImage?.rotation ?? 0}
                                    pageWidthPt={widthPt}
                                    pageHeightPt={heightPt}
                                    marginPt={marginPt}
                                    backgroundColor={settings.backgroundColor}
                                    layoutMode={settings.layoutMode}
                                />

                                <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
                                    <CardHeader className="space-y-1 pb-3">
                                        <CardTitle className="text-lg font-semibold tracking-tight">Export PDF</CardTitle>
                                        <CardDescription className="text-sm">
                                            Preview the generated PDF first, then download when ready.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="image-pdf-filename">Filename</Label>
                                            <div className="relative">
                                                <Input
                                                    id="image-pdf-filename"
                                                    value={filename}
                                                    onChange={(event) => setFilename(event.target.value)}
                                                    className="h-10 pr-14"
                                                />
                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                                    .pdf
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2.5 sm:flex-row">
                                            <Button
                                                variant="outline"
                                                className="h-10 flex-1 rounded-lg"
                                                onClick={() => void createAndHandlePdf("preview")}
                                                disabled={isProcessing || images.length === 0}
                                            >
                                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                                Preview PDF
                                            </Button>
                                            <Button
                                                className="h-10 flex-1 rounded-lg"
                                                onClick={() => void createAndHandlePdf("download")}
                                                disabled={isProcessing || images.length === 0}
                                            >
                                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                                Save PDF
                                            </Button>
                                        </div>

                                        <Button variant="ghost" className="h-9 w-full rounded-lg text-sm" onClick={resetAll} disabled={isProcessing}>
                                            Start over
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>
                    )}
                </section>
            </main>

            <Footer />

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto rounded-2xl border-border/80 p-4 sm:max-w-3xl sm:p-6">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Page setup</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5">
                        <section className="space-y-3">
                            <h3 className="text-sm font-semibold text-foreground">Page size</h3>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {PAGE_PRESET_OPTIONS.map((preset) => (
                                    <Button
                                        key={preset}
                                        variant={settings.pagePreset === preset ? "default" : "outline"}
                                        className="h-9 rounded-md"
                                        onClick={() => updateSettings("pagePreset", preset)}
                                    >
                                        {preset}
                                    </Button>
                                ))}
                            </div>

                            {settings.pagePreset === "Custom" && (
                                <div className="grid gap-3 rounded-xl border border-border/70 bg-surface/55 p-3.5 sm:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="custom-width">Width</Label>
                                        <Input
                                            id="custom-width"
                                            type="number"
                                            min={1}
                                            value={settings.customWidth}
                                            onChange={(event) => updateSettings("customWidth", clamp(Number(event.target.value || 1), 1, 2000))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="custom-height">Height</Label>
                                        <Input
                                            id="custom-height"
                                            type="number"
                                            min={1}
                                            value={settings.customHeight}
                                            onChange={(event) => updateSettings("customHeight", clamp(Number(event.target.value || 1), 1, 2000))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Unit</Label>
                                        <div className="flex gap-2">
                                            {(["mm", "cm", "in"] as const).map((unit) => (
                                                <Button
                                                    key={unit}
                                                    variant={settings.customUnit === unit ? "default" : "outline"}
                                                    className="h-9 flex-1 rounded-md"
                                                    onClick={() => updateSettings("customUnit", unit)}
                                                >
                                                    {unit}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-semibold text-foreground">Orientation</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={settings.orientation === "portrait" ? "default" : "outline"}
                                    className="h-10 rounded-md"
                                    onClick={() => updateSettings("orientation", "portrait")}
                                >
                                    <RectangleVertical className="h-4 w-4" />
                                    Portrait
                                </Button>
                                <Button
                                    variant={settings.orientation === "landscape" ? "default" : "outline"}
                                    className="h-10 rounded-md"
                                    onClick={() => updateSettings("orientation", "landscape")}
                                >
                                    <RectangleHorizontal className="h-4 w-4" />
                                    Landscape
                                </Button>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-semibold text-foreground">Background</h3>
                            <div className="flex flex-wrap items-center gap-2">
                                {COLOR_SWATCHES.map((swatch) => (
                                    <button
                                        key={swatch.value}
                                        type="button"
                                        className={cn(
                                            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm",
                                            settings.backgroundColor.toLowerCase() === swatch.value.toLowerCase()
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border bg-background text-foreground",
                                        )}
                                        onClick={() => updateSettings("backgroundColor", swatch.value)}
                                    >
                                        <span className="h-4 w-4 rounded border border-border/70" style={{ backgroundColor: swatch.value }} />
                                        {swatch.name}
                                        {settings.backgroundColor.toLowerCase() === swatch.value.toLowerCase() ? <Check className="h-3.5 w-3.5" /> : null}
                                    </button>
                                ))}

                                <label className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm">
                                    <Palette className="h-4 w-4 text-muted-foreground" />
                                    Custom
                                    <input
                                        type="color"
                                        value={settings.backgroundColor}
                                        onChange={(event) => updateSettings("backgroundColor", event.target.value)}
                                        className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                                    />
                                </label>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-semibold text-foreground">Margins</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={settings.marginPreset === "none" ? "default" : "outline"}
                                    className="h-9 rounded-md"
                                    onClick={() => updateSettings("marginPreset", "none")}
                                >
                                    No margin
                                </Button>
                                <Button
                                    variant={settings.marginPreset === "small" ? "default" : "outline"}
                                    className="h-9 rounded-md"
                                    onClick={() => updateSettings("marginPreset", "small")}
                                >
                                    Small
                                </Button>
                                <Button
                                    variant={settings.marginPreset === "standard" ? "default" : "outline"}
                                    className="h-9 rounded-md"
                                    onClick={() => updateSettings("marginPreset", "standard")}
                                >
                                    Standard
                                </Button>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-semibold text-foreground">Image layout</h3>
                            <div className="grid gap-2 sm:grid-cols-3">
                                {([
                                    { value: "fit", label: "Fit to page", hint: "Shows entire image" },
                                    { value: "fill", label: "Fill page", hint: "Covers space, may crop" },
                                    { value: "original", label: "Original size", hint: "Keeps real image size" },
                                ] as const).map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={cn(
                                            "rounded-lg border px-3 py-2.5 text-left transition-colors",
                                            settings.layoutMode === option.value
                                                ? "border-primary bg-primary/10"
                                                : "border-border bg-background hover:border-primary/30",
                                        )}
                                        onClick={() => updateSettings("layoutMode", option.value)}
                                    >
                                        <p className="text-sm font-medium text-foreground">{option.label}</p>
                                        <p className="text-xs text-muted-foreground">{option.hint}</p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <div className="flex justify-end border-t border-border/70 pt-3">
                            <Button className="h-10 rounded-lg px-5" onClick={() => setIsSettingsOpen(false)}>
                                Done
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <PdfPreviewDialog
                open={previewOpen}
                onOpenChange={closePreview}
                pdfUrl={previewPdfUrl}
                title="Image to PDF Preview"
                description="Review your generated PDF before downloading."
            />
        </div>
    )
}
