import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "Markdown to PDF Converter – Free & Private | Thirdy Gayares PDF Toolkit",
        template: "%s | Thirdy Gayares",
    },
    description:
        "Convert Markdown documents into publication-ready PDFs—100% client-side. Supports syntax highlighting, Mermaid diagrams, KaTeX math, GitHub Flavored Markdown, custom themes, and page break controls.",
    keywords: [
        "Markdown to PDF",
        "MD to PDF converter",
        "Mermaid diagram PDF",
        "KaTeX math PDF",
        "syntax highlighting PDF",
        "GitHub Flavored Markdown PDF",
        "client-side PDF generator",
        "free Markdown converter",
        "Thirdy Gayares PDF Toolkit",
    ],
    metadataBase: new URL("https://pdf-toolkit.thirdygayares.com"),
    alternates: {
        canonical: "https://pdf-toolkit.thirdygayares.com/markdown-pdf",
    },
    openGraph: {
        title: "Markdown to PDF Converter | Thirdy Gayares PDF Toolkit",
        description:
            "Turn Markdown docs with code snippets, Mermaid flowcharts, and LaTeX math into polished PDFs. No uploads, fully private.",
        url: "https://pdf-toolkit.thirdygayares.com/markdown-pdf",
        siteName: "Thirdy Gayares PDF Toolkit",
        images: [
            {
                url: "https://pdf-toolkit.thirdygayares.com/image/markdown-pdf-toolkit-by-thirdygayares.jpg",
                width: 1200,
                height: 630,
                alt: "Markdown to PDF Converter by Thirdy Gayares",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        site: "@thirdygayares",
        creator: "@thirdygayares",
        title: "Markdown to PDF Converter – Private & Free",
        description:
            "Convert Markdown with code, diagrams, and math into publication-ready PDFs—directly in your browser.",
        images: [
            "https://pdf-toolkit.thirdygayares.com/image/markdown-pdf-toolkit-by-thirdygayares.jpg",
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function MarkdownPdfLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
