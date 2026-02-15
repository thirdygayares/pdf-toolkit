import type { FAQItem } from "@/components/FAQ";

export const FaqSplitPdf: FAQItem[] = [
    {
        id: "what-is",
        question: "What does the Split PDF tool do?",
        answer: (
            <>
                It lets you upload one or multiple PDFs, choose exactly which pages to keep via thumbnails,
                and instantly download a new PDF that contains only those pages.
            </>
        ),
        answerPlain:
            "It lets you upload one or multiple PDFs, choose which pages to keep, and download a new PDF with only those pages.",
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
                Yes. Use <em>Pages per row</em> to switch layouts. On mobile you can use 1 or 2 columns;
                on desktop you can use up to 5.
            </>
        ),
        answerPlain:
            "Yes. On mobile you can use 1 or 2 columns; on desktop you can use up to 5.",
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
                Yes. You can reorder uploaded files first, then drag page cards using the handle to set
                exact output page order before you split and download.
            </>
        ),
        answerPlain:
            "Yes. Reorder uploaded files and drag page cards with the handle to set output order.",
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
                Yes. Upload multiple PDFs, reorder the file list, choose pages to keep, then download one
                combined split output.
            </>
        ),
        answerPlain:
            "Yes. Upload multiple PDFs, reorder files, select pages, then download one split output.",
    },
];
