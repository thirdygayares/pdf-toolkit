export type PageRotation = 0 | 90 | 180 | 270

export type StudioTool =
  | "hand"
  | "select"
  | "add-text"
  | "edit-text"
  | "highlighter"
  | "pen"
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "image"
  | "signature"

export type FitMode = "none" | "width" | "page"

export interface SourcePageMeta {
  width: number
  height: number
}

export interface PdfSourceRecord {
  id: string
  name: string
  bytes: Uint8Array
  pages: SourcePageMeta[]
}

export type PageSourceRef =
  | {
      kind: "source"
      sourceId: string
      sourcePageIndex: number
    }
  | {
      kind: "blank"
      width: number
      height: number
    }

export interface EditorPage {
  id: string
  source: PageSourceRef
  rotation: PageRotation
}

export interface AnnotationPoint {
  x: number
  y: number
}

interface AnnotationBase<TType extends string> {
  id: string
  pageId: string
  type: TType
  color: string
  opacity: number
  strokeWidth: number
}

interface BoxAnnotationBase<TType extends string> extends AnnotationBase<TType> {
  x: number
  y: number
  width: number
  height: number
}

export interface TextAnnotation extends BoxAnnotationBase<"text"> {
  text: string
  fontSize: number
  fontFamily: string
  whiteout: boolean
}

export interface ImageAnnotation extends BoxAnnotationBase<"image"> {
  src: string
}

export type HighlightAnnotation = BoxAnnotationBase<"highlight">

export type RectangleAnnotation = BoxAnnotationBase<"rectangle">

export type EllipseAnnotation = BoxAnnotationBase<"ellipse">

export interface PenAnnotation extends AnnotationBase<"pen"> {
  points: AnnotationPoint[]
}

interface LineAnnotationBase<TType extends "line" | "arrow"> extends AnnotationBase<TType> {
  start: AnnotationPoint
  end: AnnotationPoint
}

export type LineAnnotation = LineAnnotationBase<"line">

export type ArrowAnnotation = LineAnnotationBase<"arrow">

export type PdfAnnotation =
  | TextAnnotation
  | ImageAnnotation
  | HighlightAnnotation
  | RectangleAnnotation
  | EllipseAnnotation
  | PenAnnotation
  | LineAnnotation
  | ArrowAnnotation

export type AnnotationMap = Record<string, PdfAnnotation[]>

export interface EditorSnapshot {
  pages: EditorPage[]
  annotationsByPageId: AnnotationMap
  activePageId: string | null
}

export interface EditorHistory {
  past: EditorSnapshot[]
  present: EditorSnapshot
  future: EditorSnapshot[]
}

export interface PendingAsset {
  type: "image" | "signature"
  src: string
  width: number
  height: number
  name: string
}

export interface ViewportSize {
  width: number
  height: number
}
