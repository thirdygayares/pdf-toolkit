"use client"

import type { Dispatch, SetStateAction } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Layers, RotateCcw, Settings2, WandSparkles } from "lucide-react"
import { OverlayOptions } from "../hooks/usePdfOverlay"

interface OverlayActionProps {
    applyOverlay: () => void
    busy: boolean
    options: OverlayOptions
    setOptions: Dispatch<SetStateAction<OverlayOptions>>
    hasBothFiles: boolean
    onResetOptions: () => void
}

const SELECT_CLASSNAME =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"

interface RangeFieldProps {
    id: string
    label: string
    value: number
    min: number
    max: number
    step: number
    suffix?: string
    onChange: (value: number) => void
}

const RangeField = ({ id, label, value, min, max, step, suffix, onChange }: RangeFieldProps) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
            <Label htmlFor={id}>{label}</Label>
            <span className="text-xs font-medium text-muted-foreground">
                {value}
                {suffix ?? ""}
            </span>
        </div>
        <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => onChange(Number.parseFloat(event.target.value))}
            className="w-full accent-primary"
        />
    </div>
)

export const OverlayAction = ({
    applyOverlay,
    busy,
    options,
    setOptions,
    hasBothFiles,
    onResetOptions,
}: OverlayActionProps) => {
    const setPreset = (preset: Partial<OverlayOptions>) => {
        setOptions((prev) => ({ ...prev, ...preset }))
    }

    return (
        <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg sm:text-xl">Overlay configuration</CardTitle>
                            <Badge variant="secondary" className="rounded-full">
                                Single-flow setup
                            </Badge>
                        </div>
                        <CardDescription>
                            Control which pages are updated, how overlay pages are mapped, and where the overlay is placed.
                        </CardDescription>
                    </div>

                    <Button variant="outline" size="sm" onClick={onResetOptions} disabled={busy}>
                        <RotateCcw className="h-4 w-4" />
                        Reset options
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="rounded-xl border border-border/80 bg-surface/50 p-3.5">
                    <div className="mb-3 flex items-center gap-2">
                        <WandSparkles className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold text-foreground">Quick presets</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                setPreset({
                                    opacity: 1,
                                    placementMode: "fit",
                                    scalePercent: 100,
                                    alignX: "center",
                                    alignY: "center",
                                    offsetXPt: 0,
                                    offsetYPt: 0,
                                    overlaySourceMode: "first",
                                })
                            }
                            disabled={busy}
                        >
                            Full-page template
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                setPreset({
                                    opacity: 0.3,
                                    placementMode: "fit",
                                    scalePercent: 90,
                                    alignX: "center",
                                    alignY: "center",
                                    overlaySourceMode: "first",
                                })
                            }
                            disabled={busy}
                        >
                            Watermark overlay
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                setPreset({
                                    opacity: 0.8,
                                    placementMode: "original",
                                    scalePercent: 40,
                                    alignX: "right",
                                    alignY: "bottom",
                                    offsetXPt: -24,
                                    offsetYPt: 24,
                                    overlaySourceMode: "first",
                                })
                            }
                            disabled={busy}
                        >
                            Corner stamp
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4 rounded-xl border border-border/80 bg-background p-4">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Page targeting</p>
                            <p className="text-xs text-muted-foreground">
                                Choose which base PDF pages should receive the overlay.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="overlay-target-pages">Target pages</Label>
                            <select
                                id="overlay-target-pages"
                                className={SELECT_CLASSNAME}
                                value={options.targetPages}
                                onChange={(event) =>
                                    setOptions((prev) => ({
                                        ...prev,
                                        targetPages: event.target.value as OverlayOptions["targetPages"],
                                    }))
                                }
                                disabled={busy}
                            >
                                <option value="all">All pages</option>
                                <option value="first">First page only</option>
                                <option value="odd">Odd pages</option>
                                <option value="even">Even pages</option>
                                <option value="custom">Custom range</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="overlay-custom-range">Custom range</Label>
                            <Input
                                id="overlay-custom-range"
                                placeholder="1-3, 7, 10-12"
                                value={options.customRange}
                                onChange={(event) =>
                                    setOptions((prev) => ({
                                        ...prev,
                                        customRange: event.target.value,
                                    }))
                                }
                                disabled={busy || options.targetPages !== "custom"}
                            />
                            <p className="text-xs text-muted-foreground">
                                Used only when target pages is set to custom.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="overlay-source-mode">Overlay page mapping</Label>
                            <select
                                id="overlay-source-mode"
                                className={SELECT_CLASSNAME}
                                value={options.overlaySourceMode}
                                onChange={(event) =>
                                    setOptions((prev) => ({
                                        ...prev,
                                        overlaySourceMode: event.target.value as OverlayOptions["overlaySourceMode"],
                                    }))
                                }
                                disabled={busy}
                            >
                                <option value="first">Use overlay page 1 on all targets</option>
                                <option value="match">Match page numbers (skip missing)</option>
                                <option value="cycle">Repeat overlay pages in a loop</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-xl border border-border/80 bg-background p-4">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Placement and sizing</p>
                            <p className="text-xs text-muted-foreground">
                                Fit, fill, stretch, or keep the original overlay size, then fine-tune placement.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="overlay-placement-mode">Placement mode</Label>
                            <select
                                id="overlay-placement-mode"
                                className={SELECT_CLASSNAME}
                                value={options.placementMode}
                                onChange={(event) =>
                                    setOptions((prev) => ({
                                        ...prev,
                                        placementMode: event.target.value as OverlayOptions["placementMode"],
                                    }))
                                }
                                disabled={busy}
                            >
                                <option value="fit">Fit within page (contain)</option>
                                <option value="fill">Fill page (cover)</option>
                                <option value="original">Original overlay size</option>
                                <option value="stretch">Stretch to page bounds</option>
                            </select>
                        </div>

                        <RangeField
                            id="overlay-opacity"
                            label="Opacity"
                            value={Math.round(options.opacity * 100)}
                            min={5}
                            max={100}
                            step={5}
                            suffix="%"
                            onChange={(value) =>
                                setOptions((prev) => ({
                                    ...prev,
                                    opacity: value / 100,
                                }))
                            }
                        />

                        <RangeField
                            id="overlay-scale"
                            label="Scale multiplier"
                            value={options.scalePercent}
                            min={10}
                            max={200}
                            step={5}
                            suffix="%"
                            onChange={(value) =>
                                setOptions((prev) => ({
                                    ...prev,
                                    scalePercent: Math.round(value),
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-background p-4">
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-foreground">Alignment and offsets</p>
                        <p className="text-xs text-muted-foreground">
                            Offsets are in PDF points (72 points = 1 inch).
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="overlay-align-x">Horizontal align</Label>
                            <select
                                id="overlay-align-x"
                                className={SELECT_CLASSNAME}
                                value={options.alignX}
                                onChange={(event) =>
                                    setOptions((prev) => ({
                                        ...prev,
                                        alignX: event.target.value as OverlayOptions["alignX"],
                                    }))
                                }
                                disabled={busy}
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="overlay-align-y">Vertical align</Label>
                            <select
                                id="overlay-align-y"
                                className={SELECT_CLASSNAME}
                                value={options.alignY}
                                onChange={(event) =>
                                    setOptions((prev) => ({
                                        ...prev,
                                        alignY: event.target.value as OverlayOptions["alignY"],
                                    }))
                                }
                                disabled={busy}
                            >
                                <option value="top">Top</option>
                                <option value="center">Center</option>
                                <option value="bottom">Bottom</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="overlay-offset-x">Horizontal offset</Label>
                            <Input
                                id="overlay-offset-x"
                                type="number"
                                step="1"
                                value={options.offsetXPt}
                                onChange={(event) =>
                                    setOptions((prev) => ({
                                        ...prev,
                                        offsetXPt: Number.parseInt(event.target.value || "0", 10) || 0,
                                    }))
                                }
                                disabled={busy}
                            />
                            <p className="text-xs text-muted-foreground">Right is positive.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="overlay-offset-y">Vertical offset</Label>
                            <Input
                                id="overlay-offset-y"
                                type="number"
                                step="1"
                                value={options.offsetYPt}
                                onChange={(event) =>
                                    setOptions((prev) => ({
                                        ...prev,
                                        offsetYPt: Number.parseInt(event.target.value || "0", 10) || 0,
                                    }))
                                }
                                disabled={busy}
                            />
                            <p className="text-xs text-muted-foreground">Up is positive.</p>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">Ready to process</p>
                        <p className="text-xs text-muted-foreground">
                            Generate the overlaid PDF, then preview it before downloading.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="w-full sm:w-auto h-11 px-8 text-sm font-semibold"
                        onClick={applyOverlay}
                        disabled={!hasBothFiles || busy}
                    >
                        {busy ? (
                            <span className="flex items-center gap-2">Processing overlay...</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                Apply Overlay
                            </span>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
