"use client"

import { Bold, Italic, Underline, Trash2 } from "lucide-react"
import { useEditorContext, STROKE_COLORS } from "@/app/pdf-editor/context/EditorContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TextAnnotation, PdfAnnotation } from "@/app/pdf-editor/lib/types"

const FONT_FAMILIES = [
  { label: "Helvetica", value: "Helvetica" },
  { label: "Times", value: "Times-Roman" },
  { label: "Courier", value: "Courier" },
]

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72]

export function TextFormatBar({ annotation }: { annotation: TextAnnotation }) {
  const { updateAnnotation, removeAnnotation } = useEditorContext()
  const pageId = annotation.pageId

  const update = (partial: Partial<TextAnnotation>) => {
    updateAnnotation(pageId, annotation.id, (a) => ({ ...a, ...partial }) as PdfAnnotation)
  }

  return (
    <div
      className="pointer-events-auto absolute z-50 flex flex-wrap items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2 py-1.5 shadow-xl"
      style={{
        left: `${annotation.x * 100}%`,
        bottom: `${(1 - annotation.y) * 100}%`,
        transform: "translateY(-4px)",
        minWidth: 320,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <select
        value={annotation.fontFamily}
        onChange={(e) => update({ fontFamily: e.target.value })}
        className="h-7 rounded border border-border/60 bg-background px-1.5 text-xs"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      <select
        value={annotation.fontSize}
        onChange={(e) => update({ fontSize: Number(e.target.value) })}
        className="h-7 w-14 rounded border border-border/60 bg-background px-1 text-xs"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="mx-0.5 h-5 w-px bg-border/60" />

      <Button type="button" variant={annotation.bold ? "default" : "ghost"} size="icon" className="size-7" onClick={() => update({ bold: !annotation.bold })}>
        <Bold className="size-3.5" />
      </Button>
      <Button type="button" variant={annotation.italic ? "default" : "ghost"} size="icon" className="size-7" onClick={() => update({ italic: !annotation.italic })}>
        <Italic className="size-3.5" />
      </Button>
      <Button type="button" variant={annotation.underline ? "default" : "ghost"} size="icon" className="size-7" onClick={() => update({ underline: !annotation.underline })}>
        <Underline className="size-3.5" />
      </Button>

      <div className="mx-0.5 h-5 w-px bg-border/60" />

      <div className="flex items-center gap-1">
        {STROKE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => update({ color })}
            className={cn(
              "size-5 rounded-full border transition",
              color === annotation.color ? "ring-2 ring-primary/70 ring-offset-1" : "hover:scale-110",
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="mx-0.5 h-5 w-px bg-border/60" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 text-destructive hover:bg-destructive/10"
        onClick={() => removeAnnotation(pageId, annotation.id)}
        title="Delete"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}
