"use client"

import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  Eraser,
  Hand,
  Highlighter,
  ImagePlus,
  Loader2,
  Minus,
  MousePointer2,
  PenTool,
  Plus,
  Redo2,
  Signature,
  Square,
  Type,
  Undo2,
} from "lucide-react"

import { useEditorContext, HIGHLIGHT_COLORS, STROKE_COLORS } from "@/app/pdf-editor/context/EditorContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { StudioTool } from "@/app/pdf-editor/lib/types"

type ToolButton = {
  tool: StudioTool
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const TOOL_BUTTONS: ToolButton[] = [
  { tool: "hand", icon: Hand, label: "Hand" },
  { tool: "select", icon: MousePointer2, label: "Select" },
  { tool: "add-text", icon: Type, label: "Add text" },
  { tool: "edit-text", icon: Eraser, label: "Edit text" },
  { tool: "rectangle", icon: Square, label: "Rectangle" },
  { tool: "ellipse", icon: Circle, label: "Circle" },
  { tool: "line", icon: Minus, label: "Line" },
  { tool: "arrow", icon: ArrowRight, label: "Arrow" },
]

export function Toolbar() {
  const ctx = useEditorContext()
  const {
    selectedTool,
    setTool,
    highlightColor,
    setHighlightColor,
    strokeColor,
    setStrokeColor,
    history,
    undo,
    redo,
    isExporting,
    isBuildingPreview,
    exportPdf,
    pages,
    pendingAsset,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    imageInputRef,
    setSignatureDialogOpen,
    triggerInsertPdf,
    insertBlankPage,
  } = ctx

  const isDrawingTool = selectedTool === "pen" || selectedTool === "highlighter"

  return (
    <header className="border-b border-border/70 bg-card/90 px-3 py-3 backdrop-blur lg:px-4">
      <div className="mb-2 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 lg:hidden"
          onClick={() => setMobileSidebarOpen((v: boolean) => !v)}
        >
          {mobileSidebarOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          Pages
        </Button>

        <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Studio
        </div>

        <div className="ml-auto hidden text-xs text-muted-foreground lg:flex">
          Hold `Space` to pan · `⌘/Ctrl +/-` to zoom
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max items-center gap-1.5 pr-2">
          {TOOL_BUTTONS.map((button) => {
            const Icon = button.icon
            const isActive = selectedTool === button.tool
            return (
              <Button
                key={button.tool}
                type="button"
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn("gap-1.5", isActive && "shadow-sm")}
                onClick={() => setTool(button.tool)}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{button.label}</span>
              </Button>
            )
          })}

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Pen / Highlighter dropdown group */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant={isDrawingTool ? "default" : "ghost"}
                size="sm"
                className={cn("gap-1.5", isDrawingTool && "shadow-sm")}
              >
                {selectedTool === "highlighter" ? (
                  <Highlighter className="size-4" />
                ) : (
                  <PenTool className="size-4" />
                )}
                <span className="hidden sm:inline">
                  {selectedTool === "highlighter" ? "Highlighter" : "Pen"}
                </span>
                <ChevronDown className="size-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-3" align="start">
              <div className="space-y-3">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setTool("pen")}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
                      selectedTool === "pen" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <PenTool className="size-4" /> Pen
                  </button>
                  <button
                    type="button"
                    onClick={() => setTool("highlighter")}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
                      selectedTool === "highlighter" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <Highlighter className="size-4" /> Highlighter
                  </button>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {selectedTool === "highlighter" ? "Highlight Color" : "Stroke Color"}
                  </span>
                  <div className="mt-1.5 flex gap-1.5">
                    {(selectedTool === "highlighter" ? HIGHLIGHT_COLORS : STROKE_COLORS).map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "size-7 rounded-full border-2 transition",
                          (selectedTool === "highlighter" ? highlightColor : strokeColor) === color
                            ? "border-primary ring-2 ring-primary/40"
                            : "border-border hover:scale-110",
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          if (selectedTool === "highlighter") setHighlightColor(color)
                          else setStrokeColor(color)
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={() => imageInputRef.current?.click()}>
            <ImagePlus className="size-4" />
            <span className="hidden sm:inline">Image</span>
          </Button>

          <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={() => setSignatureDialogOpen(true)}>
            <Signature className="size-4" />
            <span className="hidden sm:inline">Signature</span>
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={undo} disabled={(history?.past.length ?? 0) === 0}>
            <Undo2 className="size-4" />
            <span className="hidden sm:inline">Undo</span>
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={redo} disabled={(history?.future.length ?? 0) === 0}>
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
  )
}
