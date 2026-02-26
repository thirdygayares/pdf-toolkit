"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
    return (
        <div className={cn("space-y-2", className)}>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
            {children}
        </div>
    )
}

export function Hint({ children }: { children: ReactNode }) {
    return <p className="text-xs text-muted-foreground">{children}</p>
}

export function UnsupportedConfigForm({
    title,
    detail,
}: {
    title: string
    detail?: string
}) {
    return (
        <div className="space-y-3 rounded-lg border border-dashed border-border/80 bg-muted/30 p-3">
            <div className="flex items-center gap-2">
                <Badge variant="secondary">Scaffolded</Badge>
                <p className="text-sm font-medium">{title}</p>
            </div>
            <p className="text-xs text-muted-foreground">
                {detail ?? "This node is registered in the Flow Builder UI, but its executor is not implemented yet in this MVP."}
            </p>
        </div>
    )
}
