"use client"
import { UnsupportedConfigForm } from "./shared"
export default function MarkdownToPdfConfig() {
    return <UnsupportedConfigForm title="Markdown to PDF" detail="The existing exporter triggers browser downloads directly and needs a pure byte-output adapter before flow execution support." />
}
