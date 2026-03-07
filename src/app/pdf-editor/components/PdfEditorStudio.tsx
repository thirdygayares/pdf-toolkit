"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Document, pdfjs } from "react-pdf"
import { Plus } from "lucide-react"

import { EditorProvider, useEditorContext } from "@/app/pdf-editor/context/EditorContext"
import { Toolbar } from "./Toolbar"
import { ThumbnailSidebar } from "./ThumbnailSidebar"
import { PageCanvasItem } from "./PageCanvasItem"
import { StatusBar } from "./StatusBar"
import { SignatureDialog } from "./SignatureDialog"

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export function PdfEditorStudio() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  )
}

function EditorLayout() {
  const ctx = useEditorContext()
  const {
    snapshot,
    pages,
    previewFileUrl,
    isBuildingPreview,
    uploadInputRef,
    insertPdfInputRef,
    imageInputRef,
    pageViewportRef,
    onUploadChange,
    onInsertPdfChange,
    onUploadImageAsset,
    loadPrimaryFile,
    openFileDialog,
    setActivePageWithoutHistory,
  } = ctx

  // ─── Intersection Observer for active page ────────────────────
  const pageObserverRef = useRef<IntersectionObserver | null>(null)
  const [observedEntries, setObservedEntries] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setObservedEntries((prev) => {
          const next = new Map(prev)
          for (const entry of entries) {
            const pageId = entry.target.getAttribute("data-page-id")
            if (pageId) {
              next.set(pageId, entry.intersectionRatio)
            }
          }
          return next
        })
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] },
    )
    pageObserverRef.current = observer
    return () => observer.disconnect()
  }, [])

  // Update active page based on most visible
  useEffect(() => {
    if (observedEntries.size === 0) return
    let maxRatio = 0
    let mostVisiblePageId: string | null = null
    for (const [pageId, ratio] of observedEntries) {
      if (ratio > maxRatio) {
        maxRatio = ratio
        mostVisiblePageId = pageId
      }
    }
    if (mostVisiblePageId && maxRatio > 0.1) {
      setActivePageWithoutHistory(mostVisiblePageId)
    }
  }, [observedEntries, setActivePageWithoutHistory])

  // Observe page elements
  useEffect(() => {
    const observer = pageObserverRef.current
    if (!observer) return

    // Small delay to ensure page elements are rendered
    const timeout = setTimeout(() => {
      observer.disconnect()
      const viewport = pageViewportRef.current
      if (!viewport) return
      const pageElements = viewport.querySelectorAll("[data-page-id]")
      pageElements.forEach((el) => observer.observe(el))
    }, 300)

    return () => clearTimeout(timeout)
  }, [pages, previewFileUrl, pageViewportRef])

  // ─── Upload screen ────────────────────────────────────────────
  if (!snapshot) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <input ref={uploadInputRef} type="file" accept="application/pdf" className="hidden" onChange={onUploadChange} />

        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)] px-6 py-10">
          <div className="w-full max-w-4xl rounded-3xl border border-border/80 bg-card/90 p-10 shadow-2xl backdrop-blur-sm">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">PDF Studio</p>
                <h1 className="mt-3 text-3xl font-semibold">Full-Suite PDF Editor & Annotator</h1>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                  Rearrange pages, rotate scans, highlight clauses, add signatures, and insert images in one workspace.
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
                if (file) await loadPrimaryFile(file)
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

  // ─── Main editor layout ───────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-background">
      <input ref={uploadInputRef} type="file" accept="application/pdf" className="hidden" onChange={onUploadChange} />
      <input ref={insertPdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={onInsertPdfChange} />
      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onUploadImageAsset} />

      <Toolbar />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <ThumbnailSidebar />

        <main className="flex min-w-0 flex-1 flex-col">
          <div ref={pageViewportRef} className="surface-grid relative flex-1 overflow-auto bg-muted/40 p-3 sm:p-4 lg:p-6">
            {!previewFileUrl ? (
              <div className="flex min-h-full min-w-full items-center justify-center">
                <div className="rounded-xl border border-dashed border-border bg-card px-8 py-12 text-sm text-muted-foreground">
                  {isBuildingPreview ? "Building live preview..." : "No page selected"}
                </div>
              </div>
            ) : (
              <Document
                file={previewFileUrl}
                loading={
                  <div className="flex min-h-full min-w-full items-center justify-center">
                    <div className="rounded-xl border border-border bg-card px-8 py-10 text-sm text-muted-foreground">
                      Rendering pages...
                    </div>
                  </div>
                }
              >
                <div className="flex flex-col items-center gap-2">
                  {pages.map((page, index) => (
                    <PageCanvasItem
                      key={page.id}
                      page={page}
                      pageIndex={index}
                      pageNumber={index + 1}
                      totalPages={pages.length}
                    />
                  ))}
                </div>
              </Document>
            )}
          </div>

          <StatusBar />
        </main>
      </div>

      <SignatureDialog />
    </div>
  )
}
