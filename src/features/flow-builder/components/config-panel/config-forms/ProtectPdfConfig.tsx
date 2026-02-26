"use client"

import { Input } from "@/components/ui/input"
import type { NodeConfigFormProps } from "@/features/flow-builder/types"
import { Field, Hint } from "./shared"

function PermissionToggle({
    label,
    checked,
    onChange,
}: {
    label: string
    checked: boolean
    onChange: (next: boolean) => void
}) {
    return (
        <label className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 text-sm">
            <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
            {label}
        </label>
    )
}

export default function ProtectPdfConfig({ config, onPatch }: NodeConfigFormProps) {
    return (
        <div className="space-y-4">
            <Field label="User Password">
                <Input
                    type="password"
                    value={String(config.userPassword ?? "")}
                    onChange={(e) => onPatch({ userPassword: e.target.value })}
                />
            </Field>
            <Field label="Owner Password (optional)">
                <Input
                    type="password"
                    value={String(config.ownerPassword ?? "")}
                    onChange={(e) => onPatch({ ownerPassword: e.target.value })}
                />
                <Hint>If empty, the user password is reused as owner password.</Hint>
            </Field>
            <div className="grid grid-cols-1 gap-2">
                <PermissionToggle label="Allow printing" checked={Boolean(config.printing ?? true)} onChange={(v) => onPatch({ printing: v })} />
                <PermissionToggle label="Allow modifying" checked={Boolean(config.modifying ?? true)} onChange={(v) => onPatch({ modifying: v })} />
                <PermissionToggle label="Allow copying" checked={Boolean(config.copying ?? true)} onChange={(v) => onPatch({ copying: v })} />
                <PermissionToggle label="Allow annotating" checked={Boolean(config.annotating ?? true)} onChange={(v) => onPatch({ annotating: v })} />
            </div>
        </div>
    )
}
