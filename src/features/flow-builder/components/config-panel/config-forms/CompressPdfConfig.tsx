"use client"

import type { NodeConfigFormProps } from "@/features/flow-builder/types"
import { Field, Hint } from "./shared"

export default function CompressPdfConfig({ config, onPatch }: NodeConfigFormProps) {
    return (
        <div className="space-y-4">
            <Field label="Strategy">
                <select
                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    value={String(config.strategy ?? "rewrite")}
                    onChange={(event) => onPatch({ strategy: event.target.value })}
                >
                    <option value="rewrite">Rewrite PDF structure (safe)</option>
                </select>
                <Hint>This MVP rewrites the PDF via `pdf-lib` and may reduce size for some files.</Hint>
            </Field>
        </div>
    )
}
