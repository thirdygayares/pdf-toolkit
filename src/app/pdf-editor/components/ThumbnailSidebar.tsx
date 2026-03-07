"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Document, Page } from "react-pdf"
import { ChevronDown, ChevronUp, Plus, RotateCw, Trash2 } from "lucide-react"

import { useEditorContext } from "@/app/pdf-editor/context/EditorContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const THUMBNAIL_ROW_HEIGHT = 228

export function ThumbnailSidebar() {
  const ctx = useEditorContext()
  const {
    pages,
    activePage,
    activePageIndex,
    previewFileUrl,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setActivePageById,
    rotatePage,
    duplicatePage,
    deletePage,
    reorderPage,
    insertBlankPage,
    triggerInsertPdf,
    scrollToPage,
  } = ctx

  const thumbnailsViewportRef = useRef<HTMLDivElement>(null)
  const [thumbnailScrollTop, setThumbnailScrollTop] = useState(0)
  const [thumbnailViewportHeight, setThumbnailViewportHeight] = useState(520)
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null)

  useEffect(() => {
    const viewport = thumbnailsViewportRef.current
    if (!viewport) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setThumbnailViewportHeight(entry.contentRect.height)
    })
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  const visibleThumbnailRange = useMemo(() => {
    if (pages.length === 0) return { start: 0, end: -1 }
    const start = Math.max(0, Math.floor(thumbnailScrollTop / THUMBNAIL_ROW_HEIGHT) - 2)
    const visibleCount = Math.ceil(thumbnailViewportHeight / THUMBNAIL_ROW_HEIGHT) + 4
    const end = Math.min(pages.length - 1, start + visibleCount)
    return { start, end }
  }, [pages.length, thumbnailScrollTop, thumbnailViewportHeight])

  const visibleThumbnailPages = useMemo(() => {
    if (visibleThumbnailRange.end < visibleThumbnailRange.start) return []
    return pages.slice(visibleThumbnailRange.start, visibleThumbnailRange.end + 1)
  }, [pages, visibleThumbnailRange.end, visibleThumbnailRange.start])

  const goToPrev = () => {
    if (activePageIndex <= 0) return
    const prevPage = pages[activePageIndex - 1]
    if (prevPage) scrollToPage(prevPage.id)
  }

  const goToNext = () => {
    if (activePageIndex >= pages.length - 1) return
    const nextPage = pages[activePageIndex + 1]
    if (nextPage) scrollToPage(nextPage.id)
  }

  return (
    <>
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
        {/* Up arrow */}
        <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={goToPrev} disabled={activePageIndex <= 0}>
            <ChevronUp className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {activePageIndex + 1} / {pages.length}
          </span>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={goToNext} disabled={activePageIndex >= pages.length - 1}>
            <ChevronDown className="size-4" />
          </Button>
        </div>

        <div className="border-b border-border/70 px-3 py-2">
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
                  <div key={page.id} className="mb-2">
                    <div
                      className={cn(
                        "rounded-xl border bg-background p-2 shadow-sm transition my-2",
                        selected ? "border-primary ring-2 ring-primary/30" : "border-border/70",
                        draggedPageId === page.id && "opacity-50",
                      )}
                      draggable
                      onDragStart={() => setDraggedPageId(page.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (!draggedPageId) return
                        const fromIndex = pages.findIndex((item) => item.id === draggedPageId)
                        reorderPage(fromIndex, index)
                        setDraggedPageId(null)
                      }}
                      onDragEnd={() => setDraggedPageId(null)}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActivePageById(page.id)
                          scrollToPage(page.id)
                        }}
                        className="group block w-full text-left"
                      >
                        <div className="flex items-center justify-between pb-2 text-xs font-medium text-muted-foreground">
                          <span>Page {index + 1}</span>
                          <span>{page.rotation}°</span>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-border bg-white">
                          <Page pageNumber={index + 1} width={220} renderTextLayer={false} renderAnnotationLayer={false} loading={<div className="h-28 bg-muted/60" />} />
                        </div>
                      </button>

                      <div className="mt-2 flex items-center gap-1">
                        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => rotatePage(page.id)}>
                          <RotateCw className="size-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => duplicatePage(page.id)}>
                          <Plus className="size-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => deletePage(page.id)}>
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
    </>
  )
}
