import Link from "next/link";
import type { FAQItem } from "@/components/FAQ";

export const ExtractTextFAQS: FAQItem[] = [
    {
        id: "what-is",
        question: "What is PDF Toolkit: Extract Text Page?",
        answer: (
            <>
                It’s a simple tool that extracts raw, selectable text from PDF files directly in your browser.
                Useful for copying, analyzing, or converting text from documents like annual reports,
                terms of service, or research papers.
            </>
        ),
        answerPlain:
            "It’s a simple tool that extracts raw, selectable text from PDF files directly in your browser. Useful for copying, analyzing, or converting text from documents like annual reports, terms of service, or research papers.",
    },
    {
        id: "accepted",
        question: "What files are accepted?",
        answer: <>Only PDF files (.pdf) are supported.</>,
        answerPlain: "Only PDF files (.pdf) are supported.",
    },
    {
        id: "multiple",
        question: "Can I upload more than one PDF at once?",
        answer: (
            <>
                Yes. You can upload multiple PDFs, reorder files and pages, then extract text from only the pages you select.
                If needed, you can still use our{" "}
                <Link className="underline font-extrabold text-primary" href="/merge-pdf">
                    Merge PDF Tool
                </Link>{" "}
                for a dedicated merge workflow.
            </>
        ),
        answerPlain:
            "Yes. You can upload multiple PDFs, reorder files and pages, then extract text from only the pages you select.",
    },
    {
        id: "ocr",
        question: "Is OCR supported for scanned PDFs?",
        answer: (
            <>
                Currently, OCR is not supported. If your file is image‑based or scanned, no text will be extracted.
                Use an external OCR tool first, then re‑upload the converted PDF.
            </>
        ),
        answerPlain:
            "OCR is not supported. For scanned/image-based PDFs, use an external OCR tool first, then re-upload the converted PDF.",
    },
    {
        id: "privacy",
        question: "Is the file uploaded to a server?",
        answer: <>No. All processing happens in your browser, keeping your files private and secure.</>,
        answerPlain:
            "No. All processing happens in your browser, keeping your files private and secure.",
    },
];
