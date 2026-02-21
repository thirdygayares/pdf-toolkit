"use client"

import dynamic from "next/dynamic"

const PdfEditorStudio = dynamic(
  () => import("@/app/pdf-editor/components/PdfEditorStudio").then((module) => module.PdfEditorStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading Studio...
      </div>
    ),
  },
)

export function PdfEditorStudioClient() {
  return <PdfEditorStudio />
}
