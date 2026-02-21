import type { Metadata } from "next"
import { PdfEditorStudioClient } from "@/app/pdf-editor/components/PdfEditorStudioClient"

export const metadata: Metadata = {
  title: "PDF Studio",
  description: "Edit, annotate, reorder, and export PDFs in one full-screen workspace.",
}

export default function PdfEditorPage() {
  return <PdfEditorStudioClient />
}
