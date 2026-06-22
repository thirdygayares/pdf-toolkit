# Compare PDF

Side-by-side comparison of two PDFs. Both documents render to canvases and the
**added / removed text** is highlighted directly on the page. Everything runs in
the browser — the PDFs never leave the user's device.

Route: [`/compare-pdf`](../../app/compare-pdf) · Entry component: [`ComparePdfApp`](./components/ComparePdfApp.tsx)

## User flow

1. **Upload** an _Original_ (left) and a _Revised_ (right) PDF. `Swap` flips the two; `Compare PDFs` starts the diff.
2. **Compare** — both docs load via pdf.js; each page's text is extracted with positions and diffed.
3. **Review** — pages render side by side:
   - 🟥 red highlight = text present in the **original** but not the revised (removed)
   - 🟩 green highlight = text present in the **revised** but not the original (added)
   - **Scroll sync** keeps both columns aligned (toggle off to scroll independently)
   - **Zoom** (shared) re-renders both sides
   - **Prev / Next** jump to the next page that has differences
4. **New comparison** resets everything and frees the pdf.js documents.

## Architecture

```
features/compare-pdf/
├─ types.ts                 Shared types. Geometry is ALWAYS stored at scale 1.0.
├─ lib/
│  ├─ pdf.ts                pdf.js loader + per-page positioned text extraction
│  ├─ diff.ts               LCS sequence diff (+ multiset fallback for huge pages)
│  └─ compare.ts            Orchestrates extract → diff → CompareResult + summary
├─ hooks/
│  └─ useComparePdf.ts      Lifecycle: load both PDFs, run diff, own/destroy proxies
└─ components/
   ├─ ComparePdfApp.tsx     Top-level: scroll sync, zoom, diff navigation
   ├─ CompareUpload.tsx     Two-slot upload (Original / Revised) + Swap
   ├─ CompareToolbar.tsx    Scroll-sync toggle, zoom, diff nav, reset
   ├─ DiffSummary.tsx       Counts + legend
   ├─ ComparePane.tsx       One scrollable column of pages
   └─ ComparePage.tsx       One page: lazy canvas render + highlight overlay
```

### How the diff works

- Pages are aligned by **page number** (page 1 ↔ page 1, …). A page that exists on
  only one side is always flagged as a difference.
- For each page we read pdf.js text items, build a positioned box per run
  (`lib/pdf.ts`), then diff the **ordered list of run strings** with an LCS
  (`lib/diff.ts`). Runs in the common subsequence are `equal`; left-only runs are
  `removed`, right-only runs are `added`.
- Whitespace is normalized before comparison, so spacing-only changes are ignored.
- Diffing is at the **text-run granularity** (the chunks pdf.js emits), not
  per-character — fast and visually clear, but a run is highlighted whole even if
  only part of it changed.

### Rendering & geometry

- All boxes and page dimensions are stored at **scale 1.0**. The render layer
  multiplies by the active zoom, so changing zoom never recomputes the diff.
- Each page renders **lazily** (an `IntersectionObserver` triggers the canvas
  render ~400px before it enters view) and cancels its in-flight `RenderTask` if
  the zoom changes mid-render.
- The pdf.js worker is served from `/public/pdf.worker.min.mjs`, kept in sync with
  the installed `pdfjs-dist` by `scripts/copy-pdf-worker.mjs`.

## Known limitations / future work

- Run-level (not word- or character-level) highlighting; whole runs light up.
- Diff is **textual** — it does not detect moved/changed images, vector graphics,
  or pure layout changes.
- Pages are matched 1:1 by index; it does not detect inserted/deleted pages and
  re-align the rest.
- Scanned/image-only PDFs have no extractable text, so nothing is highlighted
  (the pages still render for visual comparison).
