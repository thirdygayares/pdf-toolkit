"use client"

import { Input } from "@/components/ui/input"
import type { NodeConfigFormProps } from "@/features/flow-builder/types"
import { Field, Hint } from "./shared"

export default function PdfOutputConfig({ config, onPatch }: NodeConfigFormProps) {
    return (
        <div className="space-y-4">
            <Field label="Archive Name">
                <Input
                    value={String(config.archiveName ?? "flow-output")}
                    onChange={(event) => onPatch({ archiveName: event.target.value })}
                    placeholder="flow-output"
                />
            </Field>
            <Field label="Package Mode">
                <select
                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    value={String(config.packageMode ?? "auto")}
                    onChange={(event) => onPatch({ packageMode: event.target.value })}
                >
                    <option value="auto">Auto (single file direct, else ZIP)</option>
                    <option value="zip">Always ZIP</option>
                </select>
                <Hint>When the flow outputs multiple results, ZIP packaging is used automatically.</Hint>
            </Field>
        </div>
    )
}
