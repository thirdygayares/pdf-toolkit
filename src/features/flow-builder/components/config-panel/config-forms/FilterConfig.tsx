"use client"

import { Input } from "@/components/ui/input"
import type { NodeConfigFormProps } from "@/features/flow-builder/types"
import { Field, Hint } from "./shared"

export default function FilterConfig({ config, onPatch }: NodeConfigFormProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <Field label="Min Pages">
                    <Input
                        type="number"
                        min={0}
                        value={String(config.minPages ?? 0)}
                        onChange={(e) => onPatch({ minPages: Math.max(0, Number(e.target.value) || 0) })}
                    />
                </Field>
                <Field label="Max Pages">
                    <Input
                        type="number"
                        min={0}
                        value={String(config.maxPages ?? 0)}
                        onChange={(e) => onPatch({ maxPages: Math.max(0, Number(e.target.value) || 0) })}
                    />
                </Field>
            </div>
            <Hint>Set `0` for no limit. Files outside the range are marked as skipped.</Hint>
        </div>
    )
}
