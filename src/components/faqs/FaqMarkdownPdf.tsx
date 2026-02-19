import type { FAQItem } from "@/components/FAQ";

export const MarkdownPdfFAQS: FAQItem[] = [
    {
        id: "what-is",
        question: "What is the Markdown to PDF converter?",
        answer: (
            <>
                It is a browser-based tool that converts Markdown documents into
                publication-ready PDFs. It supports syntax-highlighted code blocks,
                KaTeX math equations, GitHub Flavored Markdown,
                and precise page layout controls—all without uploading your files to
                a server.
            </>
        ),
        answerPlain:
            "A browser-based tool that converts Markdown documents into publication-ready PDFs with syntax highlighting, KaTeX math, and page layout controls—without any server uploads.",
    },
    {
        id: "math",
        question: "How do I include math equations?",
        answer: (
            <>
                Use standard LaTeX syntax: inline equations with{" "}
                <code>$ E = mc^2 $</code> and display (block) equations with{" "}
                <code>$$ ... $$</code>. The renderer uses KaTeX for fast,
                high-fidelity output.
            </>
        ),
        answerPlain:
            "Use $ ... $ for inline equations and $$ ... $$ for display equations. The renderer uses KaTeX for fast output.",
    },
    {
        id: "page-breaks",
        question: "How do I force a page break?",
        answer: (
            <>
                Insert{" "}
                <code>{"<!-- pagebreak -->"}</code> or <code>\newpage</code> on its
                own line in your Markdown. The converter will push everything after
                that marker to the top of the next PDF page.
            </>
        ),
        answerPlain:
            "Insert <!-- pagebreak --> or \\newpage on its own line to push content to the next page.",
    },
    {
        id: "widow-orphan",
        question: "What is widow/orphan control?",
        answer: (
            <>
                Widow/orphan control prevents headings (H1–H3) from being stranded at
                the bottom of a page while the paragraph they introduce starts on the
                next page. The converter automatically keeps headings attached to the
                content that follows them using CSS{" "}
                <code>break-after: avoid</code> rules.
            </>
        ),
        answerPlain:
            "Widow/orphan control prevents H1–H3 headings from being stranded at the bottom of a page. The converter keeps headings attached to the following paragraph using CSS break-after: avoid rules.",
    },
    {
        id: "themes",
        question: "What themes are available?",
        answer: (
            <>
                Three built-in themes are provided:{" "}
                <strong>Documentation</strong> (clean sans-serif, sidebar-style layout),{" "}
                <strong>Manuscript</strong> (serif fonts, double-spaced, reading-friendly),
                and <strong>Terminal</strong> (dark background with monospaced styling).
                A Custom CSS option for advanced overrides is planned.
            </>
        ),
        answerPlain:
            "Three themes: Documentation (sans-serif), Manuscript (serif, double-spaced), and Terminal (dark, monospaced). Custom CSS is planned.",
    },
    {
        id: "privacy",
        question: "Are my files uploaded to a server?",
        answer: (
            <>
                No. All processing happens entirely in your browser. Your Markdown
                content never leaves your device.
            </>
        ),
        answerPlain:
            "No. All processing happens in your browser. Your Markdown content never leaves your device.",
    },
];
