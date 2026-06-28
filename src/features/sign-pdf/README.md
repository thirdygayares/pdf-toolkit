# Sign PDF

Add a **signature, initials, or company stamp** to a PDF and download the signed
file. Everything runs in the browser — the PDF never leaves the user's device.

Route: [`/sign-pdf`](../../app/sign-pdf) · Entry component: [`SignPdfApp`](./components/SignPdfApp.tsx)

## User flow

1. **Upload** a PDF.
2. **Add signature** opens the creator modal:
   - **Tabs (kind):** Signature · Initials · Company Stamp
   - **Methods (left rail):** Type · Draw · Upload
     - **Type** — renders your name/initials in a handwriting font (5 choices) + ink color
     - **Draw** — freehand on a canvas pad + ink color
     - **Upload** — a PNG/JPG image of your signature (PNG transparency preserved)
     - **Stamp** — a bordered company stamp from the Full name field
   - **Apply** rasterizes the mark to a transparent PNG, adds it to the "Your marks" tray, and drops one copy on the page currently in view.
3. **Place** — drag a mark to move it, use the corner handle to resize (aspect-locked), the ✕ to delete. Click a tray mark then click anywhere on a page to drop another copy (Esc cancels).
4. **Download signed PDF** flattens every placement into the PDF via pdf-lib.

## Architecture

```
features/sign-pdf/
├─ types.ts                 Shared types. Placements use page-ratio coordinates (0..1).
├─ fonts.ts                 Self-hosted handwriting fonts (next/font/local).
├─ fonts/*.woff2            OFL font files (committed for offline use).
├─ lib/
│  ├─ pdf.ts                pdf.js loader + page dimensions (scale 1.0 == PDF points)
│  ├─ signature-render.ts   Rasterize type/draw/upload/stamp → transparent PNG
│  └─ export.ts             pdf-lib: embed placements (top-left ratio → bottom-left points)
├─ hooks/
│  └─ useSignPdf.ts         Lifecycle: load PDF, page dims, placements, export
└─ components/
   ├─ SignPdfApp.tsx        Top-level: upload vs workspace
   ├─ SignWorkspace.tsx     Toolbar, tray, scrollable page viewer, zoom
   ├─ PdfPageView.tsx       One page: lazy canvas render + click-to-place
   ├─ PlacementBox.tsx      Drag/resize/delete a placed mark
   └─ SignatureModal.tsx    The "Set your signature details" creator
```

### Why everything becomes a PNG

Typed, drawn, uploaded, and stamp marks are all rasterized to a **transparent PNG**
(`lib/signature-render.ts`). Downstream code (placement boxes + pdf-lib export) only
deals with PNGs, so there's a single embedding path. Typed text is rendered to a
canvas using the handwriting font's real family name (`font.style.fontFamily`) after
`document.fonts.load(...)`; the image is then trimmed to its ink bounds.

### Coordinates

- Placements are stored as **ratios of the page** (xRatio/yRatio top-left, wRatio/hRatio),
  so they're zoom-independent.
- pdf.js renders with a top-left origin; pdf-lib draws with a **bottom-left** origin,
  so export converts `y = pageHeight - yRatio*pageHeight - drawHeight`.
- Page dimensions are read at scale 1.0, which equals PDF points — the same units
  pdf-lib uses — so the on-screen layout matches the exported file.

## Known limitations / future work

- Output is a **flattened** image stamp, not a cryptographic/digital signature.
- Typed signatures are rasterized (not embedded as selectable text/vector font).
- No saved-signature persistence across sessions (marks live only in the tab).
- Drawing is mouse/touch freehand; no smoothing/vectorization.
