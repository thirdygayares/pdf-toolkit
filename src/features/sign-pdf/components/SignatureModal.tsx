"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { CircleUserRound, Loader2, PenTool, Stamp, Type, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { DEFAULT_FONT_ID, SIGNATURE_FONTS } from "../fonts"
import { SIGNATURE_COLORS, type InputMethod, type MarkKind, type SignatureAsset } from "../types"
import {
    renderDrawnSignature,
    renderStamp,
    renderTypedSignature,
    renderUploadedImage,
} from "../lib/signature-render"

interface SignatureModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onApply: (asset: SignatureAsset) => void
}

const KIND_TABS: { id: MarkKind; label: string; icon: typeof PenTool }[] = [
    { id: "signature", label: "Signature", icon: PenTool },
    { id: "initials", label: "Initials", icon: Type },
    { id: "stamp", label: "Company Stamp", icon: Stamp },
]

const METHOD_RAIL: { id: InputMethod; label: string; icon: typeof Type }[] = [
    { id: "type", label: "Type", icon: Type },
    { id: "draw", label: "Draw", icon: PenTool },
    { id: "upload", label: "Upload", icon: Upload },
]

let assetCounter = 0
const nextAssetId = () => {
    assetCounter += 1
    return `asset-${assetCounter}`
}

export function SignatureModal({ open, onOpenChange, onApply }: SignatureModalProps) {
    const [kind, setKind] = useState<MarkKind>("signature")
    const [method, setMethod] = useState<InputMethod>("type")
    const [fullName, setFullName] = useState("")
    const [initials, setInitials] = useState("")
    const [fontId, setFontId] = useState(DEFAULT_FONT_ID)
    const [color, setColor] = useState<string>(SIGNATURE_COLORS[0].value)
    const [uploadPreview, setUploadPreview] = useState<{ file: File; url: string } | null>(null)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const drawCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const drawingRef = useRef(false)
    const lastPointRef = useRef<{ x: number; y: number } | null>(null)
    const [hasInk, setHasInk] = useState(false)

    // The text rendered for type/stamp depends on the active kind.
    const typedText = kind === "initials" ? initials || "AB" : fullName || "Signature"
    const stampText = fullName || "Company"

    useEffect(() => {
        return () => {
            if (uploadPreview) URL.revokeObjectURL(uploadPreview.url)
        }
    }, [uploadPreview])

    const clearDrawing = useCallback(() => {
        const canvas = drawCanvasRef.current
        const ctx = canvas?.getContext("2d")
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
        setHasInk(false)
    }, [])

    const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = drawCanvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        return {
            x: ((event.clientX - rect.left) / rect.width) * canvas.width,
            y: ((event.clientY - rect.top) / rect.height) * canvas.height,
        }
    }

    const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        drawingRef.current = true
        lastPointRef.current = pointFromEvent(event)
    }

    const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return
        const canvas = drawCanvasRef.current
        const ctx = canvas?.getContext("2d")
        const last = lastPointRef.current
        if (!canvas || !ctx || !last) return

        const point = pointFromEvent(event)
        ctx.strokeStyle = color
        ctx.lineWidth = 3.5
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.beginPath()
        ctx.moveTo(last.x, last.y)
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
        lastPointRef.current = point
        setHasInk(true)
    }

    const handlePointerUp = () => {
        drawingRef.current = false
        lastPointRef.current = null
    }

    const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return
        if (!file.type.startsWith("image/")) {
            setError("Please choose an image file (PNG or JPG).")
            return
        }
        setError(null)
        if (uploadPreview) URL.revokeObjectURL(uploadPreview.url)
        setUploadPreview({ file, url: URL.createObjectURL(file) })
    }

    const activeFont = SIGNATURE_FONTS.find((font) => font.id === fontId) ?? SIGNATURE_FONTS[0]

    const canApply =
        method === "draw" ? hasInk : method === "upload" ? Boolean(uploadPreview) : true

    const handleApply = async () => {
        setBusy(true)
        setError(null)
        try {
            let raster
            if (method === "draw") {
                const canvas = drawCanvasRef.current
                if (!canvas) throw new Error("Drawing canvas is not ready.")
                raster = renderDrawnSignature(canvas)
            } else if (method === "upload") {
                if (!uploadPreview) throw new Error("Choose an image first.")
                raster = await renderUploadedImage(uploadPreview.file)
            } else if (kind === "stamp") {
                raster = await renderStamp(stampText, color)
            } else {
                raster = await renderTypedSignature(typedText, activeFont.fontFamily, color)
            }

            const asset: SignatureAsset = {
                id: nextAssetId(),
                kind,
                method,
                dataUrl: raster.dataUrl,
                width: raster.width,
                height: raster.height,
            }
            onApply(asset)
            onOpenChange(false)
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Could not create the signature.")
        } finally {
            setBusy(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl gap-0 p-0">
                <DialogHeader className="border-b border-border px-6 py-4">
                    <DialogTitle className="text-xl">Set your signature details</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 px-6 py-5">
                    {/* Name + initials */}
                    <div className="flex items-start gap-4">
                        <div className="mt-6 hidden rounded-full border border-primary/40 p-2 text-primary sm:block">
                            <CircleUserRound className="h-6 w-6" />
                        </div>
                        <div className="grid flex-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="sig-fullname">Full name:</Label>
                                <Input
                                    id="sig-fullname"
                                    placeholder="Your name"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="sig-initials">Initials:</Label>
                                <Input
                                    id="sig-initials"
                                    placeholder="Your initials"
                                    value={initials}
                                    onChange={(event) => setInitials(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Kind tabs */}
                    <div className="flex gap-6 border-b border-border">
                        {KIND_TABS.map((tab) => {
                            const Icon = tab.icon
                            const active = tab.id === kind
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setKind(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors",
                                        active
                                            ? "border-primary text-foreground"
                                            : "border-transparent text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", active ? "text-primary" : "")} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Method rail + content */}
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface/50 p-1.5">
                            {METHOD_RAIL.map((item) => {
                                const Icon = item.icon
                                const active = item.id === method
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        title={item.label}
                                        aria-label={item.label}
                                        onClick={() => setMethod(item.id)}
                                        className={cn(
                                            "rounded-md p-2 transition-colors",
                                            active
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </button>
                                )
                            })}
                        </div>

                        <div className="min-h-[260px] flex-1">
                            {method === "type" ? (
                                <TypePanel
                                    kind={kind}
                                    typedText={typedText}
                                    stampText={stampText}
                                    color={color}
                                    fontId={fontId}
                                    onFontChange={setFontId}
                                />
                            ) : null}

                            {method === "draw" ? (
                                <div className="space-y-3">
                                    <div className="rounded-lg border border-border bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.02)_10px,rgba(0,0,0,0.02)_20px)]">
                                        <canvas
                                            ref={drawCanvasRef}
                                            width={640}
                                            height={240}
                                            className="h-[240px] w-full touch-none rounded-lg"
                                            onPointerDown={handlePointerDown}
                                            onPointerMove={handlePointerMove}
                                            onPointerUp={handlePointerUp}
                                            onPointerLeave={handlePointerUp}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">Draw your signature above.</p>
                                        <Button type="button" variant="ghost" size="sm" onClick={clearDrawing} disabled={!hasInk}>
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                            ) : null}

                            {method === "upload" ? (
                                <div className="space-y-3">
                                    <label className="flex h-[240px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface/40 text-center hover:border-primary/40">
                                        {uploadPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={uploadPreview.url} alt="Signature preview" className="max-h-[200px] max-w-[90%] object-contain" />
                                        ) : (
                                            <>
                                                <Upload className="h-8 w-8 text-primary" />
                                                <span className="text-sm font-medium text-foreground">Upload a signature image</span>
                                                <span className="text-xs text-muted-foreground">PNG with transparency works best</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadChange} />
                                    </label>
                                </div>
                            ) : null}

                            {/* Color row (not relevant for uploaded images). */}
                            {method !== "upload" ? (
                                <div className="mt-4 flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">Color:</span>
                                    {SIGNATURE_COLORS.map((swatch) => (
                                        <button
                                            key={swatch.id}
                                            type="button"
                                            aria-label={swatch.id}
                                            onClick={() => setColor(swatch.value)}
                                            className={cn(
                                                "h-5 w-5 rounded-full ring-offset-2 transition",
                                                color === swatch.value ? "ring-2 ring-foreground/40" : "",
                                            )}
                                            style={{ backgroundColor: swatch.value }}
                                        />
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {error ? <p className="text-sm text-danger">{error}</p> : null}
                </div>

                <DialogFooter className="border-t border-border px-6 py-4">
                    <Button type="button" onClick={handleApply} disabled={!canApply || busy}>
                        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Apply
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface TypePanelProps {
    kind: MarkKind
    typedText: string
    stampText: string
    color: string
    fontId: string
    onFontChange: (id: string) => void
}

/** Font picker (signature/initials) or a single stamp preview. */
function TypePanel({ kind, typedText, stampText, color, fontId, onFontChange }: TypePanelProps) {
    if (kind === "stamp") {
        return (
            <div className="flex h-[240px] items-center justify-center rounded-lg border border-border bg-surface/30">
                <div
                    className="rounded-md border-2 px-6 py-3 text-lg font-bold uppercase tracking-wide"
                    style={{ color, borderColor: color }}
                >
                    {stampText}
                </div>
            </div>
        )
    }

    return (
        <div className="max-h-[240px] overflow-y-auto rounded-lg border border-border">
            {SIGNATURE_FONTS.map((font) => {
                const active = font.id === fontId
                return (
                    <button
                        key={font.id}
                        type="button"
                        onClick={() => onFontChange(font.id)}
                        className={cn(
                            "flex w-full items-center gap-4 border-b border-border px-4 py-3 text-left last:border-b-0 transition-colors",
                            active ? "bg-success/10" : "hover:bg-accent/40",
                        )}
                    >
                        <span
                            className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                                active ? "border-success" : "border-muted-foreground/40",
                            )}
                        >
                            {active ? <span className="h-2.5 w-2.5 rounded-full bg-success" /> : null}
                        </span>
                        <span className={cn("truncate text-2xl", font.className)} style={{ color }}>
                            {typedText}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
