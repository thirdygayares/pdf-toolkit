"use client"
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef } from "react"
import { Page } from "react-pdf"
import { Trash2 } from "lucide-react"

import { useEditorContext } from "@/app/pdf-editor/context/EditorContext"
import { clamp, createId, normalizeRect, translateAnnotation } from "@/app/pdf-editor/lib/pdfStudio"
import type { EditorPage, PdfAnnotation, TextAnnotation, ResizeDirection } from "@/app/pdf-editor/lib/types"
import { ArrowHead } from "./ArrowHead"
import { DraftAnnotation } from "./DraftAnnotation"
import { ResizeHandles, computeResizedBounds } from "./ResizeHandles"
import { TextFormatBar } from "./TextFormatBar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PageCanvasItemProps {
  page: EditorPage
  pageIndex: number
  pageNumber: number
  totalPages: number
}

export function PageCanvasItem({ page, pageIndex, pageNumber, totalPages }: PageCanvasItemProps) {
  const ctx = useEditorContext()
  const {
    effectiveTool,
    selectedAnnotationId,
    setSelectedAnnotationId,
    highlightColor,
    strokeColor,
    pendingAsset,
    draftAnnotation,
    setDraftAnnotation,
    dragPreview,
    setDragPreview,
    inlineEditAnnotationId,
    inlineEditValue,
    setInlineEditValue,
    inlineEditRef,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    startInlineEdit,
    commitInlineEdit,
    cancelInlineEdit,
    setTool,
    setPendingAsset,
    drawSessionRef,
    dragSessionRef,
    panSessionRef,
    resizeSessionRef,
    pageViewportRef,
    pageRefsMap,
    getAnnotationsForPage,
    getDisplayForPage,
    activePage,
    setActivePageWithoutHistory,
  } = ctx

  const overlayRef = useRef<HTMLDivElement>(null)
  const pageContainerRef = useRef<HTMLDivElement>(null)

  const annotations = getAnnotationsForPage(page.id)
  const display = getDisplayForPage(page)
  const isActivePage = activePage?.id === page.id

  // Register page ref for scroll-to-page
  useEffect(() => {
    const el = pageContainerRef.current
    if (el) {
      pageRefsMap.current.set(page.id, el)
      return () => {
        pageRefsMap.current.delete(page.id)
      }
    }
  }, [page.id, pageRefsMap])

  // ─── Coordinate normalization ─────────────────────────────────
  const getNormalizedPoint = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const frame = overlayRef.current?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect()
    return {
      x: clamp((event.clientX - frame.left) / frame.width, 0, 1),
      y: clamp((event.clientY - frame.top) / frame.height, 0, 1),
    }
  }, [])

  // ─── Resize start ─────────────────────────────────────────────
  const startResize = useCallback(
    (direction: ResizeDirection, event: React.PointerEvent<HTMLElement>, annotation: PdfAnnotation) => {
      if (!("x" in annotation)) return
      event.currentTarget.setPointerCapture(event.pointerId)
      const point = getNormalizedPoint(event)
      resizeSessionRef.current = {
        annotationId: annotation.id,
        pageId: page.id,
        direction,
        startPoint: point,
        originalBounds: { x: annotation.x, y: annotation.y, width: annotation.width, height: annotation.height },
      }
    },
    [getNormalizedPoint, page.id, resizeSessionRef],
  )

  // ─── Annotation drag start ────────────────────────────────────
  const startAnnotationDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, annotation: PdfAnnotation) => {
      if (effectiveTool !== "select") return
      event.stopPropagation()
      const point = getNormalizedPoint(event)
      dragSessionRef.current = { annotation, startX: point.x, startY: point.y }
      setSelectedAnnotationId(annotation.id)
      setActivePageWithoutHistory(page.id)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [effectiveTool, getNormalizedPoint, dragSessionRef, setSelectedAnnotationId, setActivePageWithoutHistory, page.id],
  )

  // ─── Pointer handlers ─────────────────────────────────────────
  const beginOverlayInteraction = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!display) return
      if (event.button !== 0) return

      // Set this page as active
      setActivePageWithoutHistory(page.id)

      if (effectiveTool === "hand") {
        const viewport = pageViewportRef.current
        if (!viewport) return
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
        const newTextAnnotation: TextAnnotation = {
          id: createId("annotation"),
          pageId: page.id,
          type: "text",
          x: point.x,
          y: point.y,
          width: 0.3,
          height: 0.08,
          text: "",
          color: strokeColor,
          opacity: 1,
          strokeWidth: 1,
          fontSize: 18,
          fontFamily: "Helvetica",
          whiteout: false,
          bold: false,
          italic: false,
          underline: false,
        }
        addAnnotation(newTextAnnotation)
        startInlineEdit(newTextAnnotation.id, "")
        setTool("select")
        return
      }

      if (effectiveTool === "edit-text") {
        const newWhiteoutAnnotation: TextAnnotation = {
          id: createId("annotation"),
          pageId: page.id,
          type: "text",
          x: point.x,
          y: point.y,
          width: 0.34,
          height: 0.08,
          text: "",
          color: strokeColor,
          opacity: 1,
          strokeWidth: 1,
          fontSize: 18,
          fontFamily: "Helvetica",
          whiteout: true,
          bold: false,
          italic: false,
          underline: false,
        }
        addAnnotation(newWhiteoutAnnotation)
        startInlineEdit(newWhiteoutAnnotation.id, "")
        setTool("select")
        return
      }

      if ((effectiveTool === "image" || effectiveTool === "signature") && pendingAsset) {
        const width = pendingAsset.width
        const height = pendingAsset.height
        addAnnotation({
          id: createId("annotation"),
          pageId: page.id,
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

      if (effectiveTool === "pen") {
        event.currentTarget.setPointerCapture(event.pointerId)
        drawSessionRef.current = { mode: "pen" }
        setDraftAnnotation({
          id: createId("annotation"),
          pageId: page.id,
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
            pageId: page.id,
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
          pageId: page.id,
          type: effectiveTool === "highlighter" ? "highlight" : effectiveTool,
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
          color: effectiveTool === "highlighter" ? highlightColor : strokeColor,
          opacity: effectiveTool === "highlighter" ? 0.34 : 0.9,
          strokeWidth: 2,
        } as PdfAnnotation)
      }
    },
    [
      display, effectiveTool, getNormalizedPoint, page.id, strokeColor, highlightColor,
      pendingAsset, addAnnotation, startInlineEdit, setTool, setPendingAsset,
      setDraftAnnotation, setSelectedAnnotationId, setActivePageWithoutHistory,
      drawSessionRef, panSessionRef, pageViewportRef,
    ],
  )

  const moveOverlayInteraction = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const point = getNormalizedPoint(event)

      if (panSessionRef.current) {
        const viewport = pageViewportRef.current
        if (!viewport) return
        const pan = panSessionRef.current
        viewport.scrollLeft = pan.scrollLeft - (event.clientX - pan.clientX)
        viewport.scrollTop = pan.scrollTop - (event.clientY - pan.clientY)
      }

      // Resize session
      if (resizeSessionRef.current && display) {
        const session = resizeSessionRef.current
        const deltaX = point.x - session.startPoint.x
        const deltaY = point.y - session.startPoint.y
        const annotation = annotations.find((a) => a.id === session.annotationId)
        const maintainAspect = annotation?.type === "image"
        const newBounds = computeResizedBounds(session.originalBounds, session.direction, deltaX, deltaY, maintainAspect)
        // Live preview via drag preview (reusing for visual feedback)
        setDragPreview(null)
        updateAnnotation(page.id, session.annotationId, (a) => {
          if (!("x" in a)) return a
          return { ...a, ...newBounds }
        })
        return
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
      if (!drawSession || !draftAnnotation) return

      if (drawSession.mode === "pen" && draftAnnotation.type === "pen") {
        setDraftAnnotation({ ...draftAnnotation, points: [...draftAnnotation.points, point] })
        return
      }

      if (drawSession.mode === "shape") {
        if (draftAnnotation.type === "line" || draftAnnotation.type === "arrow") {
          setDraftAnnotation({ ...draftAnnotation, end: point })
          return
        }

        if (draftAnnotation.type === "highlight" || draftAnnotation.type === "rectangle" || draftAnnotation.type === "ellipse") {
          const rect = normalizeRect(drawSession.startX, drawSession.startY, point.x, point.y)
          setDraftAnnotation({ ...draftAnnotation, x: rect.x, y: rect.y, width: rect.width, height: rect.height })
        }
      }
    },
    [
      getNormalizedPoint, display, draftAnnotation, annotations, page.id,
      panSessionRef, pageViewportRef, dragSessionRef, drawSessionRef, resizeSessionRef,
      setDragPreview, setDraftAnnotation, updateAnnotation,
    ],
  )

  const endOverlayInteraction = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const point = getNormalizedPoint(event)

      // Finish resize
      if (resizeSessionRef.current) {
        resizeSessionRef.current = null
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
        return
      }

      if (dragSessionRef.current && dragPreview) {
        const moved = translateAnnotation(dragSessionRef.current.annotation, dragPreview.deltaX, dragPreview.deltaY)
        updateAnnotation(page.id, dragSessionRef.current.annotation.id, () => moved)
      }

      const drawSession = drawSessionRef.current
      if (drawSession && draftAnnotation) {
        if (draftAnnotation.type === "pen" && draftAnnotation.points.length >= 2) {
          addAnnotation(draftAnnotation)
        }
        if ((draftAnnotation.type === "line" || draftAnnotation.type === "arrow") && drawSession.mode === "shape") {
          const deltaX = Math.abs(draftAnnotation.start.x - draftAnnotation.end.x)
          const deltaY = Math.abs(draftAnnotation.start.y - draftAnnotation.end.y)
          if (deltaX > 0.002 || deltaY > 0.002) addAnnotation(draftAnnotation)
        }
        if (
          (draftAnnotation.type === "highlight" || draftAnnotation.type === "rectangle" || draftAnnotation.type === "ellipse") &&
          drawSession.mode === "shape"
        ) {
          if (Math.abs(draftAnnotation.width) > 0.005 && Math.abs(draftAnnotation.height) > 0.005) {
            addAnnotation(draftAnnotation)
          }
        }
      }

      if (panSessionRef.current) panSessionRef.current = null
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      drawSessionRef.current = null
      dragSessionRef.current = null
      setDraftAnnotation(null)
      setDragPreview(null)
      void point
    },
    [
      getNormalizedPoint, dragPreview, draftAnnotation, page.id,
      addAnnotation, updateAnnotation, setDraftAnnotation, setDragPreview,
      drawSessionRef, dragSessionRef, panSessionRef, resizeSessionRef,
    ],
  )

  if (!display) return null

  // Find selected annotation for this page
  const selectedAnnotation = selectedAnnotationId
    ? annotations.find((a) => a.id === selectedAnnotationId)
    : null
  const selectedTextAnnotation =
    selectedAnnotation?.type === "text" ? (selectedAnnotation as TextAnnotation) : null

  return (
    <div ref={pageContainerRef} data-page-id={page.id} className="relative mb-6">
      <div
        className={cn(
          "relative mx-auto overflow-hidden rounded-lg border bg-white shadow-2xl",
          isActivePage ? "border-primary/40" : "border-border",
        )}
        style={{ width: display.renderedWidth, height: display.renderedHeight }}
      >
        <Page
          pageNumber={pageNumber}
          width={Math.round(display.renderedWidth)}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />

        {/* Overlay */}
        <div
          ref={overlayRef}
          className={cn(
            "absolute inset-0",
            effectiveTool === "hand" ? "cursor-grab" : "cursor-crosshair",
            effectiveTool === "select" && "cursor-default",
          )}
          style={{ touchAction: "none" }}
          onPointerDown={beginOverlayInteraction}
          onPointerMove={moveOverlayInteraction}
          onPointerUp={endOverlayInteraction}
        >
          {/* Box annotations */}
          {annotations.map((annotation) => {
            if (annotation.type === "line" || annotation.type === "arrow" || annotation.type === "pen") return null

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
                  onPointerDown={(e) => startAnnotationDrag(e, annotation)}
                  onPointerMove={moveOverlayInteraction}
                  onPointerUp={endOverlayInteraction}
                  onClick={(e) => { e.stopPropagation(); setSelectedAnnotationId(annotation.id) }}
                  className={cn("absolute", isSelected && "ring-2 ring-primary/60")}
                  style={{ ...baseStyle, backgroundColor: annotation.color }}
                >
                  {isSelected && effectiveTool === "select" && (
                    <ResizeHandles onResizeStart={(dir, e) => startResize(dir, e, annotation)} />
                  )}
                </div>
              )
            }

            if (annotation.type === "rectangle") {
              return (
                <div
                  key={annotation.id}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => startAnnotationDrag(e, annotation)}
                  onPointerMove={moveOverlayInteraction}
                  onPointerUp={endOverlayInteraction}
                  onClick={(e) => { e.stopPropagation(); setSelectedAnnotationId(annotation.id) }}
                  className={cn("absolute border-2", isSelected && "ring-2 ring-primary/60")}
                  style={{ ...baseStyle, borderColor: annotation.color }}
                >
                  {isSelected && effectiveTool === "select" && (
                    <ResizeHandles onResizeStart={(dir, e) => startResize(dir, e, annotation)} />
                  )}
                </div>
              )
            }

            if (annotation.type === "ellipse") {
              return (
                <div
                  key={annotation.id}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => startAnnotationDrag(e, annotation)}
                  onPointerMove={moveOverlayInteraction}
                  onPointerUp={endOverlayInteraction}
                  onClick={(e) => { e.stopPropagation(); setSelectedAnnotationId(annotation.id) }}
                  className={cn("absolute rounded-full border-2", isSelected && "ring-2 ring-primary/60")}
                  style={{ ...baseStyle, borderColor: annotation.color }}
                >
                  {isSelected && effectiveTool === "select" && (
                    <ResizeHandles onResizeStart={(dir, e) => startResize(dir, e, annotation)} />
                  )}
                </div>
              )
            }

            if (annotation.type === "text") {
              const isEditing = inlineEditAnnotationId === annotation.id
              return (
                <div
                  key={annotation.id}
                  role={isEditing ? undefined : "button"}
                  tabIndex={isEditing ? undefined : 0}
                  onPointerDown={isEditing ? undefined : (e) => startAnnotationDrag(e, annotation)}
                  onPointerMove={isEditing ? undefined : moveOverlayInteraction}
                  onPointerUp={isEditing ? undefined : endOverlayInteraction}
                  onClick={isEditing ? undefined : (e) => { e.stopPropagation(); setSelectedAnnotationId(annotation.id) }}
                  onDoubleClick={isEditing ? undefined : (e) => { e.stopPropagation(); startInlineEdit(annotation.id, annotation.text) }}
                  className={cn(
                    "absolute rounded-sm px-1.5 py-1 leading-snug",
                    isSelected && !isEditing && "ring-2 ring-primary/60",
                    isEditing && "ring-2 ring-blue-500/70 shadow-lg",
                  )}
                  style={{
                    ...baseStyle,
                    color: annotation.color,
                    backgroundColor: annotation.whiteout ? "#ffffff" : undefined,
                    height: isEditing ? "auto" : baseStyle.height,
                    minHeight: baseStyle.height,
                    zIndex: isEditing ? 50 : undefined,
                    overflow: isEditing ? "visible" : "hidden",
                    fontWeight: annotation.bold ? "bold" : "normal",
                    fontStyle: annotation.italic ? "italic" : "normal",
                    textDecoration: annotation.underline ? "underline" : "none",
                    fontSize: `${annotation.fontSize}px`,
                    fontFamily: annotation.fontFamily,
                  }}
                >
                  {isEditing ? (
                    <textarea
                      ref={inlineEditRef}
                      value={inlineEditValue}
                      onChange={(e) => {
                        setInlineEditValue(e.target.value)
                        const el = e.currentTarget
                        el.style.height = "auto"
                        el.style.height = `${el.scrollHeight}px`
                      }}
                      onBlur={commitInlineEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") { e.preventDefault(); cancelInlineEdit() }
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); commitInlineEdit() }
                        e.stopPropagation()
                      }}
                      className="m-0 block w-full resize-none border-none bg-transparent p-0 leading-snug outline-none"
                      style={{
                        color: annotation.color,
                        fontFamily: annotation.fontFamily,
                        fontSize: `${annotation.fontSize}px`,
                        fontWeight: annotation.bold ? "bold" : "normal",
                        fontStyle: annotation.italic ? "italic" : "normal",
                        minHeight: "1.5em",
                      }}
                      placeholder="Type here..."
                      autoFocus
                      rows={1}
                    />
                  ) : (
                    <span className="whitespace-pre-wrap">
                      {annotation.text || <span className="italic opacity-30 select-none">double-click to edit</span>}
                    </span>
                  )}
                  {isSelected && effectiveTool === "select" && !isEditing && (
                    <ResizeHandles onResizeStart={(dir, e) => startResize(dir, e, annotation)} />
                  )}
                </div>
              )
            }

            // Image annotation
            return (
              <div
                key={annotation.id}
                role="button"
                tabIndex={0}
                onPointerDown={(e) => startAnnotationDrag(e, annotation)}
                onPointerMove={moveOverlayInteraction}
                onPointerUp={endOverlayInteraction}
                onClick={(e) => { e.stopPropagation(); setSelectedAnnotationId(annotation.id) }}
                className={cn("absolute overflow-hidden rounded-sm", isSelected && "ring-2 ring-primary/60")}
                style={baseStyle}
              >
                <img src={annotation.src} alt="Inserted annotation" className="size-full object-contain" draggable={false} />
                {isSelected && effectiveTool === "select" && (
                  <ResizeHandles onResizeStart={(dir, e) => startResize(dir, e, annotation)} />
                )}
              </div>
            )
          })}

          {/* SVG annotations layer */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full">
            {annotations.map((annotation) => {
              const isSelected = selectedAnnotationId === annotation.id

              if (annotation.type === "line" || annotation.type === "arrow") {
                const x1 = annotation.start.x * 100
                const y1 = annotation.start.y * 100
                const x2 = annotation.end.x * 100
                const y2 = annotation.end.y * 100

                return (
                  <g key={annotation.id} opacity={annotation.opacity}>
                    <line
                      x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
                      stroke={annotation.color}
                      strokeWidth={annotation.strokeWidth}
                      strokeLinecap="round"
                    />
                    {annotation.type === "arrow" ? (
                      <ArrowHead startX={x1} startY={y1} endX={x2} endY={y2} color={annotation.color} />
                    ) : null}
                    {isSelected ? (
                      <circle cx={`${x2}%`} cy={`${y2}%`} r={6} fill="none" stroke="var(--primary)" strokeWidth={2} />
                    ) : null}
                  </g>
                )
              }

              if (annotation.type === "pen") {
                const points = annotation.points
                  .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x * 100},${pt.y * 100}`)
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

            {/* Draft annotation for this page only */}
            {draftAnnotation && draftAnnotation.pageId === page.id ? (
              <DraftAnnotation annotation={draftAnnotation} />
            ) : null}
          </svg>

          {/* Text format bar for selected text */}
          {selectedTextAnnotation && selectedTextAnnotation.pageId === page.id && effectiveTool === "select" && (
            <TextFormatBar annotation={selectedTextAnnotation} />
          )}

          {/* Delete button on selected annotation */}
          {selectedAnnotation && selectedAnnotation.pageId === page.id && effectiveTool === "select" && "x" in selectedAnnotation && (
            <div
              className="pointer-events-auto absolute z-30"
              style={{
                left: `${(selectedAnnotation.x + selectedAnnotation.width) * 100}%`,
                top: `${selectedAnnotation.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="size-6 rounded-full shadow-md"
                onClick={(e) => {
                  e.stopPropagation()
                  removeAnnotation(page.id, selectedAnnotation.id)
                }}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Page number badge */}
      <div className="mt-2 text-center text-xs text-muted-foreground">
        {pageNumber} / {totalPages}
      </div>
    </div>
  )
}
