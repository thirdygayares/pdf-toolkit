"use client"

import { Handle, type HandleProps } from "@xyflow/react"
import { cn } from "@/lib/utils"
import type { DataType } from "../../types"

const colorByType: Record<DataType, string> = {
    pdf: "!bg-red-500 border-red-200",
    text: "!bg-blue-500 border-blue-200",
    images: "!bg-emerald-500 border-emerald-200",
    "pdf-list": "!bg-orange-500 border-orange-200",
    any: "!bg-zinc-500 border-zinc-200",
}

export function NodeHandle({ dataType, className, ...props }: HandleProps & { dataType: DataType }) {
    return (
        <Handle
            {...props}
            className={cn("!h-3 !w-3 !border-2 !border-background shadow-sm", colorByType[dataType], className)}
        />
    )
}
