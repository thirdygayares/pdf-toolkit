"use client"

import { useEditorContext } from "@/app/pdf-editor/context/EditorContext"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function SignatureDialog() {
  const {
    signatureDialogOpen,
    setSignatureDialogOpen,
    signatureMode,
    setSignatureMode,
    signatureText,
    setSignatureText,
    signatureUploadDataUrl,
    signatureCanvasRef,
    startSignatureDrawing,
    continueSignatureDrawing,
    endSignatureDrawing,
    clearSignatureCanvas,
    useDrawnSignature,
    useTypedSignature,
    onSignatureUpload,
    useUploadedSignature,
  } = useEditorContext()

  return (
    <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Signature</DialogTitle>
          <DialogDescription>Draw, type, or upload your signature and place it anywhere in the PDF.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={signatureMode === "draw" ? "default" : "outline"} size="sm" onClick={() => setSignatureMode("draw")}>
            Draw
          </Button>
          <Button type="button" variant={signatureMode === "type" ? "default" : "outline"} size="sm" onClick={() => setSignatureMode("type")}>
            Type
          </Button>
          <Button type="button" variant={signatureMode === "upload" ? "default" : "outline"} size="sm" onClick={() => setSignatureMode("upload")}>
            Upload
          </Button>
        </div>

        {signatureMode === "draw" ? (
          <div className="space-y-3">
            <canvas
              ref={signatureCanvasRef}
              width={900}
              height={280}
              className="h-52 w-full rounded-xl border border-border bg-white"
              onPointerDown={startSignatureDrawing}
              onPointerMove={continueSignatureDrawing}
              onPointerUp={endSignatureDrawing}
            />
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={clearSignatureCanvas}>
                Clear
              </Button>
              <Button type="button" size="sm" onClick={useDrawnSignature}>
                Use drawn signature
              </Button>
            </div>
          </div>
        ) : null}

        {signatureMode === "type" ? (
          <div className="space-y-3">
            <Input value={signatureText} onChange={(e) => setSignatureText(e.target.value)} placeholder="Type signature text" />
            <div className="rounded-xl border border-border bg-white p-5 text-4xl" style={{ fontFamily: "cursive" }}>
              {signatureText || "Signature"}
            </div>
            <Button type="button" size="sm" onClick={useTypedSignature}>
              Use typed signature
            </Button>
          </div>
        ) : null}

        {signatureMode === "upload" ? (
          <div className="space-y-3">
            <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={onSignatureUpload} />
            {signatureUploadDataUrl ? (
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={signatureUploadDataUrl} alt="Uploaded signature" className="max-h-36 object-contain" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Upload a PNG or JPG signature image.</p>
            )}
            <Button type="button" size="sm" onClick={useUploadedSignature}>
              Use uploaded signature
            </Button>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setSignatureDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
