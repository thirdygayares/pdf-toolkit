import type { PdfAnnotation } from "@/app/pdf-editor/lib/types"
import { ArrowHead } from "./ArrowHead"

export function DraftAnnotation({ annotation }: { annotation: PdfAnnotation }) {
  if (annotation.type === "line" || annotation.type === "arrow") {
    const x1 = annotation.start.x * 100
    const y1 = annotation.start.y * 100
    const x2 = annotation.end.x * 100
    const y2 = annotation.end.y * 100

    return (
      <g opacity={annotation.opacity}>
        <line
          x1={`${x1}%`}
          y1={`${y1}%`}
          x2={`${x2}%`}
          y2={`${y2}%`}
          stroke={annotation.color}
          strokeWidth={annotation.strokeWidth}
          strokeLinecap="round"
          strokeDasharray="5 4"
        />
        {annotation.type === "arrow" ? (
          <ArrowHead startX={x1} startY={y1} endX={x2} endY={y2} color={annotation.color} dashed />
        ) : null}
      </g>
    )
  }

  if (annotation.type === "pen") {
    const points = annotation.points
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x * 100},${point.y * 100}`)
      .join(" ")

    return (
      <path
        d={points}
        fill="none"
        opacity={annotation.opacity}
        stroke={annotation.color}
        strokeWidth={annotation.strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray="4 2"
      />
    )
  }

  if ("x" in annotation) {
    return (
      <rect
        x={`${annotation.x * 100}%`}
        y={`${annotation.y * 100}%`}
        width={`${annotation.width * 100}%`}
        height={`${annotation.height * 100}%`}
        rx={annotation.type === "ellipse" ? 999 : 0}
        ry={annotation.type === "ellipse" ? 999 : 0}
        fill={annotation.type === "highlight" ? annotation.color : "transparent"}
        fillOpacity={annotation.type === "highlight" ? annotation.opacity : 0}
        stroke={annotation.type === "highlight" ? "none" : annotation.color}
        strokeWidth={annotation.type === "highlight" ? 0 : annotation.strokeWidth}
        strokeDasharray="5 4"
      />
    )
  }

  return null
}
