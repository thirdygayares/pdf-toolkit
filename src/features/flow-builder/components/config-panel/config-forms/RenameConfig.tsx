"use client"

import { Input } from "@/components/ui/input"
import type { NodeConfigFormProps } from "@/features/flow-builder/types"
import { Field, Hint } from "./shared"

export default function RenameConfig({ config, onPatch }: NodeConfigFormProps) {
    return (
        <div className="space-y-4">
            <Field label="Pattern">
                <Input
                    value={String(config.pattern ?? "{name}-processed")}
                    onChange={(e) => onPatch({ pattern: e.target.value })}
                    placeholder="{name}-processed"
                />
                <Hint>Tokens: `{'{name}'}`, `{'{ext}'}`, `{'{index}'}`, `{'{timestamp}'}`</Hint>
            </Field>
        </div>
    )
}
