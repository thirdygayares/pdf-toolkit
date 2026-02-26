"use client"

import { Input } from "@/components/ui/input"
import type { NodeConfigFormProps } from "@/features/flow-builder/types"
import { Field, Hint } from "./shared"

export default function SplitPdfConfig({ config, onPatch }: NodeConfigFormProps) {
    return (
        <div className="space-y-4">
            <Field label="Mode">
                <select
                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    value={String(config.mode ?? "all")}
                    onChange={(event) => onPatch({ mode: event.target.value })}
                >
                    <option value="all">All pages (pass-through copy)</option>
                    <option value="odd">Odd pages</option>
                    <option value="even">Even pages</option>
                    <option value="range">Custom range</option>
                </select>
            </Field>
            <Field label="Page Range">
                <Input
                    value={String(config.pageRange ?? "")}
                    onChange={(event) => onPatch({ pageRange: event.target.value })}
                    placeholder="1-3,5,7-9"
                />
                <Hint>Used when mode is set to custom range.</Hint>
            </Field>
        </div>
    )
}
