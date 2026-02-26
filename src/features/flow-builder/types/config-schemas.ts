import type { UploadedFile } from "@/hooks/useFileUpload"

export interface PdfInputConfig {
    inputKind: "pdf"
}

export interface PdfOutputConfig {
    archiveName: string
    packageMode: "auto" | "zip"
}

export interface SplitPdfConfig {
    mode: "all" | "odd" | "even" | "range"
    pageRange: string
}

export interface MergePdfConfig {
    mode: "unsupported"
}

export interface ExtractTextConfig {
    trim: boolean
}

export interface PdfToImageConfig {
    format: "png" | "jpg"
    dpi: 72 | 300
}

export interface ImageToPdfConfig {
    mode: "unsupported"
}

export interface MarkdownToPdfConfig {
    mode: "unsupported"
}

export interface CompressPdfConfig {
    strategy: "rewrite"
}

export interface WatermarkPdfConfig {
    text: string
    fontSize: number
    opacity: number
    color: string
    rotation: number
}

export interface PageNumbersPdfConfig {
    positionX: "left" | "center" | "right"
    positionY: "top" | "bottom"
    margin: number
    formatStyle: "n" | "n_of_total" | "dash_n_dash"
    fontSize: number
}

export interface ProtectPdfConfig {
    userPassword: string
    ownerPassword: string
    printing: boolean
    modifying: boolean
    copying: boolean
    annotating: boolean
}

export interface FilterConfig {
    minPages: number
    maxPages: number
}

export interface RenameConfig {
    pattern: string
}

export type NodeConfigByType = {
    "pdf-input": PdfInputConfig
    "pdf-output": PdfOutputConfig
    "split-pdf": SplitPdfConfig
    "merge-pdf": MergePdfConfig
    "extract-text": ExtractTextConfig
    "pdf-to-image": PdfToImageConfig
    "image-to-pdf": ImageToPdfConfig
    "markdown-to-pdf": MarkdownToPdfConfig
    "compress-pdf": CompressPdfConfig
    "watermark-pdf": WatermarkPdfConfig
    "page-numbers-pdf": PageNumbersPdfConfig
    "protect-pdf": ProtectPdfConfig
    filter: FilterConfig
    rename: RenameConfig
}

export type GenericNodeConfig = Record<string, unknown>

export interface NodeConfigFormRuntime {
    batchFiles: UploadedFile[]
    addBatchFiles: (files: File[]) => void
    removeBatchFile: (id: string) => void
    clearBatchFiles: () => void
}

export interface NodeConfigFormProps {
    nodeId: string
    config: GenericNodeConfig
    onPatch: (patch: GenericNodeConfig) => void
    runtime: NodeConfigFormRuntime
}
