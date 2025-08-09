import Link from "next/link";
import type { FAQItem } from "@/components/FAQ";

export const FaqSplitPdf: FAQItem[] = [
    {
        id: "what-is",
        question: "What does the Split PDF tool do?",
        answer: (
            <>
                It lets you upload a PDF, choose exactly which pages to keep via thumbnails, and instantly
                download a new PDF that contains only those pages.
            </>
        ),
        answerPlain:
            "It lets you upload a PDF, choose which pages to keep via thumbnails, and download a new PDF with only those pages.",
    },
    {
        id: "how-select",
        question: "How do I select pages?",
        answer: (
            <>
                Click a page tile to toggle it on/off. Use the toolbar to <strong>Select all</strong>,{" "}
                <strong>Unselect all</strong>, or <strong>Invert selection</strong>. The header shows the
                file name, total pages, and how many are currently selected.
            </>
        ),
        answerPlain:
            "Click a page tile to toggle it. Use Select all, Unselect all, or Invert selection. The header shows total and selected pages.",
    },
    {
        id: "grid",
        question: "Can I change the thumbnail grid size?",
        answer: (
            <>
                Yes. Use <em>Pages per row</em> to switch between 1–5 columns so you can preview large
                pages comfortably or scan many pages at once.
            </>
        ),
        answerPlain:
            "Yes. Use Pages per row to switch between 1–5 columns.",
    },
    {
        id: "processing",
        question: "Is my PDF uploaded to a server?",
        answer: (
            <>
                No. All processing happens in your browser. Your file never leaves your device.
            </>
        ),
        answerPlain:
            "No. Everything runs in your browser and your file never leaves your device.",
    },
    {
        id: "quality",
        question: "Will splitting change quality or content?",
        answer: (
            <>
                No. The tool copies the selected pages as-is—no re-compression or editing—so text and image
                quality are preserved.
            </>
        ),
        answerPlain:
            "No. Selected pages are copied as-is without recompression, so quality is preserved.",
    },
    {
        id: "limits",
        question: "Are there file size or page count limits?",
        answer: (
            <>
                There’s no hard server limit because everything runs locally. Performance depends on your
                device and browser memory. For very large PDFs, try splitting in batches.
            </>
        ),
        answerPlain:
            "No fixed server limits; performance depends on your device/browser memory. For very large PDFs, split in batches.",
    },
    {
        id: "encrypted",
        question: "Can I split a password-protected PDF?",
        answer: (
            <>
                Not yet. Encrypted PDFs aren’t supported for splitting. Unlock the PDF first, then upload it
                here.
            </>
        ),
        answerPlain:
            "Not yet. Encrypted PDFs are not supported. Unlock the PDF first, then upload.",
    },
    {
        id: "forms-bookmarks",
        question: "Are bookmarks, metadata, or forms preserved?",
        answer: (
            <>
                Page content (text, images, vector graphics) is preserved. Some document-level features
                like outlines/bookmarks or certain metadata may not carry over in the output PDF.
            </>
        ),
        answerPlain:
            "Page content is preserved. Some document-level features (bookmarks/metadata) may not carry over.",
    },
    {
        id: "reorder",
        question: "Can I reorder pages while splitting?",
        answer: (
            <>
                This tool focuses on selecting pages to keep. Reordering isn’t supported here.
            </>
        ),
        answerPlain:
            "No. This tool is for selecting pages to keep; it does not reorder pages.",
    },
    {
        id: "mobile",
        question: "Does it work on mobile?",
        answer: (
            <>
                Yes, it works in modern mobile browsers. For very large PDFs, desktop is recommended for a
                smoother experience.
            </>
        ),
        answerPlain:
            "Yes. It works on modern mobile browsers, but desktop is smoother for very large PDFs.",
    },
    {
        id: "filename",
        question: "How is the output file named?",
        answer: (
            <>
                By default it uses your original filename with <code>split</code> and a timestamp. You can
                rename it in the download dialog before saving.
            </>
        ),
        answerPlain:
            "It uses the original filename with 'split' and a timestamp. You can rename it before downloading.",
    },
    {
        id: "reset",
        question: "Can I start over or process another PDF?",
        answer: (
            <>
                Yep. Use <strong>Start over</strong> to reset the current file, or choose{" "}
                <strong>Split another PDF</strong> after downloading.
            </>
        ),
        answerPlain:
            "Yes. Use Start over to reset or Split another PDF after downloading.",
    },
    {
        id: "multiple-files",
        question: "Can I split multiple PDFs at once?",
        answer: (
            <>
                This page handles one file at a time. If you need to combine files before splitting, try our{" "}
                <Link href="/merge-pdf" className="underline font-extrabold text-primary">
                    Merge PDF
                </Link>{" "}
                tool first.
            </>
        ),
        answerPlain:
            "One file at a time. To combine files before splitting, use the Merge PDF tool first.",
    },
];
