"use client"

import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react"

export default function CustomEdge(props: EdgeProps) {
    const [path] = getBezierPath(props)

    return <BaseEdge path={path} style={{ strokeWidth: 2, opacity: 0.9 }} markerEnd={props.markerEnd} />
}
