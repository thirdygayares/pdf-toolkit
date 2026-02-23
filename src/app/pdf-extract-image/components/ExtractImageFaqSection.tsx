"use client";

import { FAQ, type FAQItem } from "@/components/FAQ";

const items: FAQItem[] = [
    {
        id: "local-processing",
        question: "Does this upload my PDF to a server?",
        answer: "No. The extraction flow runs locally in your browser, and the PDF stays on your device during processing.",
    },
    {
        id: "multi-pdf",
        question: "Can I extract images from multiple PDFs at once?",
        answer:
            "Yes. You can upload multiple PDFs, extract them in one run, review the combined image list, and export selected images as a ZIP.",
    },
    {
        id: "deleted-images",
        question: "If I delete an image card, will it be removed from the ZIP download?",
        answer: "Yes. Deleted images are removed from the active result list, so they will not be included in selected/all ZIP exports.",
    },
    {
        id: "image-types",
        question: "Why are extracted images downloaded as PNG?",
        answer:
            "The tool normalizes extracted image data to PNG for consistent local preview and download behavior across different embedded PDF image formats.",
    },
    {
        id: "no-images-found",
        question: "What if the PDF shows pictures but no images are extracted?",
        answer:
            "Some PDFs flatten content into page drawings or use formats that are not exposed as extractable embedded images. In that case, PDF-to-image conversion may work better.",
    },
    {
        id: "large-pdfs",
        question: "Can I process large PDFs?",
        answer:
            "Yes, but performance depends on your device memory and browser. For very large PDFs, try extracting in smaller batches to keep the UI responsive.",
    },
];

export const ExtractImageFaqSection = () => {
    return (
        <FAQ
            items={items}
            title="PDF Extract Image FAQs"
            description="Answers about local processing, multi-PDF extraction, downloads, and image behavior."
            className="max-w-6xl"
            richResults
        />
    );
};
