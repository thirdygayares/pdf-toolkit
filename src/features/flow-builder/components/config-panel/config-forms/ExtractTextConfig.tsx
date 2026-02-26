"use client"

import type { NodeConfigFormProps } from "@/features/flow-builder/types"
import { Field, Hint } from "./shared"

export default function ExtractTextConfig({ config, onPatch }: NodeConfigFormProps) {
    return (
        <div className="space-y-4">
            <Field label="Trim Output">
                <label className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 text-sm">
                    <input
                        type="checkbox"
                        checked={Boolean(config.trim ?? true)}
                        onChange={(event) => onPatch({ trim: event.target.checked })}
                    />
                    Remove leading and trailing whitespace
                </label>
                <Hint>Outputs plain text packets (`.txt`) for the PDF Output node.</Hint>
            </Field>
        </div>
    )
}
