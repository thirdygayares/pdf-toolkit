"use client"

import { Input } from "@/components/ui/input"
import type { NodeConfigFormProps } from "@/features/flow-builder/types"
import { Field } from "./shared"

export default function WatermarkPdfConfig({ config, onPatch }: NodeConfigFormProps) {
    return (
        <div className="space-y-4">
            <Field label="Text">
                <Input value={String(config.text ?? "CONFIDENTIAL")} onChange={(e) => onPatch({ text: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Font Size">
                    <Input
                        type="number"
                        min={8}
                        max={200}
                        value={String(config.fontSize ?? 36)}
                        onChange={(e) => onPatch({ fontSize: Number(e.target.value) || 36 })}
                    />
                </Field>
                <Field label="Opacity">
                    <Input
                        type="number"
                        min={0}
                        max={1}
                        step={0.05}
                        value={String(config.opacity ?? 0.2)}
                        onChange={(e) => onPatch({ opacity: Number(e.target.value) || 0 })}
                    />
                </Field>
                <Field label="Color">
                    <Input value={String(config.color ?? "#888888")} onChange={(e) => onPatch({ color: e.target.value })} />
                </Field>
                <Field label="Rotation">
                    <Input
                        type="number"
                        min={-180}
                        max={180}
                        value={String(config.rotation ?? 45)}
                        onChange={(e) => onPatch({ rotation: Number(e.target.value) || 0 })}
                    />
                </Field>
            </div>
        </div>
    )
}
