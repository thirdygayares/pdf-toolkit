"use client"

import { ArrowLeftRight, ZoomIn, ZoomOut } from "lucide-react"

import { useEditorContext } from "@/app/pdf-editor/context/EditorContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function StatusBar() {
  const {
    pages,
    pageJumpInput,
    setPageJumpInput,
    onPageJumpSubmit,
    zoomIn,
    zoomOut,
    fitMode,
    setFitMode,
    zoomPercent,
    getDisplayForPage,
    activePage,
  } = useEditorContext()

  const display = activePage ? getDisplayForPage(activePage) : null

  return (
    <footer className="border-t border-border/70 bg-card/80 px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Page</span>
        <Input
          value={pageJumpInput}
          onChange={(event) => setPageJumpInput(event.target.value)}
          onBlur={onPageJumpSubmit}
          onKeyDown={(event) => {
            if (event.key === "Enter") onPageJumpSubmit()
          }}
          className="h-8 w-20"
        />
        <span className="text-sm text-muted-foreground">of {pages.length}</span>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button type="button" variant="outline" size="icon" className="size-8" onClick={zoomOut}>
          <ZoomOut className="size-4" />
        </Button>
        <span className="w-16 text-center text-sm font-medium">
          {Math.round(display?.scale ? display.scale * 100 : zoomPercent)}%
        </span>
        <Button type="button" variant="outline" size="icon" className="size-8" onClick={zoomIn}>
          <ZoomIn className="size-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button type="button" variant={fitMode === "width" ? "default" : "outline"} size="sm" onClick={() => setFitMode("width")}>
          Fit width
        </Button>
        <Button type="button" variant={fitMode === "page" ? "default" : "outline"} size="sm" onClick={() => setFitMode("page")}>
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
  )
}
