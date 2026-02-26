"use client"

import { Input } from "@/components/ui/input"
import type { NodeConfigFormProps } from "@/features/flow-builder/types"
import { Field } from "./shared"

export default function PageNumbersConfig({ config, onPatch }: NodeConfigFormProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <Field label="Horizontal">
                    <select
                        className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                        value={String(config.positionX ?? "center")}
                        onChange={(e) => onPatch({ positionX: e.target.value })}
                    >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </select>
                </Field>
                <Field label="Vertical">
                    <select
                        className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                        value={String(config.positionY ?? "bottom")}
                        onChange={(e) => onPatch({ positionY: e.target.value })}
                    >
                        <option value="bottom">Bottom</option>
                        <option value="top">Top</option>
                    </select>
                </Field>
                <Field label="Margin">
                    <Input
                        type="number"
                        min={0}
                        value={String(config.margin ?? 24)}
                        onChange={(e) => onPatch({ margin: Number(e.target.value) || 0 })}
                    />
                </Field>
                <Field label="Font Size">
                    <Input
                        type="number"
                        min={6}
                        value={String(config.fontSize ?? 12)}
                        onChange={(e) => onPatch({ fontSize: Number(e.target.value) || 12 })}
                    />
                </Field>
            </div>
            <Field label="Format">
                <select
                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                    value={String(config.formatStyle ?? "n")}
                    onChange={(e) => onPatch({ formatStyle: e.target.value })}
                >
                    <option value="n">1</option>
                    <option value="n_of_total">1 of 10</option>
                    <option value="dash_n_dash">- 1 -</option>
                </select>
            </Field>
        </div>
    )
}
