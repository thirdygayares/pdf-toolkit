// src/app/split-pdf/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "Split PDF Pages Online – Free & Secure | Thirdy Gayares PDF Toolkit",
        template: "%s | Thirdy Gayares",
    },
    description:
        "Upload a PDF, pick exact pages to keep using thumbnail preview (1–5 columns), and download instantly. 100% private—processed in your browser.",
    keywords: [
        "Split PDF",
        "PDF splitter",
        "Extract PDF pages",
        "Remove PDF pages",
        "Select pages to keep",
        "Free PDF split tool",
        "Secure PDF split",
        "No upload PDF tool",
        "Browser PDF tools",
        "PDF toolkit",
        "Thirdy Gayares",
        "Next.js PDF tool",
        "TailwindCSS UI",
        "Privacy first PDF",
    ],
    metadataBase: new URL("https://pdf-toolkit.thirdygayares.com"),
    publisher: "Thirdy Gayares",
    authors: [{ name: "Thirdy Gayares", url: "https://thirdygayares.com" }],
    alternates: {
        canonical: "https://pdf-toolkit.thirdygayares.com/split-pdf",
    },
    openGraph: {
        title: "Free & Secure PDF Splitter | Select Pages and Download",
        description:
            "Choose exactly which pages to keep and export a new PDF—right in your browser. No uploads, no limits.",
        url: "https://pdf-toolkit.thirdygayares.com/split-pdf",
        siteName: "Thirdy Gayares PDF Toolkit",
        images: [
            {
                url: "https://pdf-toolkit.thirdygayares.com/image/split-pdf-toolkit-by-thirdygayares.jpg",
                width: 1200,
                height: 630,
                alt: "Split PDF Pages Online by Thirdy Gayares",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        site: "@thirdygayares",
        title: "Split PDF Pages Securely – Seamless Page Selection",
        description:
            "Pick pages via thumbnail grid (1–5 columns) and download instantly. Built with Next.js + Tailwind.",
        images: [
            "https://pdf-toolkit.thirdygayares.com/image/split-pdf-toolkit-by-thirdygayares.jpg",
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function SplitPDFLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
