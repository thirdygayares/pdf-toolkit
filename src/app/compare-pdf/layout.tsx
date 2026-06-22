import type { Metadata } from "next";

const title = "Compare PDFs Online – Side-by-Side Diff | Thirdy Gayares PDF Toolkit";
const description =
    "Upload two PDFs and compare them side by side. Added and removed text is highlighted directly on the rendered pages, with synchronized scrolling, shared zoom, and jump-to-difference. 100% private—processed in your browser.";

export const metadata: Metadata = {
    title: {
        default: title,
        template: "%s | Thirdy Gayares PDF Toolkit",
    },
    description: description,
    keywords: [
        "Compare PDF online",
        "PDF diff",
        "Side by side PDF comparison",
        "Compare two PDF files",
        "PDF difference checker",
        "Highlight PDF changes",
        "Free PDF compare tool",
        "No upload PDF tool",
        "Browser PDF tools",
        "Thirdy Gayares PDF Toolkit",
    ],

    metadataBase: new URL("https://pdf-toolkit.thirdygayares.com"),
    publisher: "Thirdy Gayares",
    authors: [{ name: "Thirdy Gayares", url: "https://thirdygayares.com" }],
    alternates: {
        canonical: "https://pdf-toolkit.thirdygayares.com/compare-pdf",
    },
    openGraph: {
        title: title,
        description: description,
        url: "https://pdf-toolkit.thirdygayares.com/compare-pdf",
        siteName: "Thirdy Gayares PDF Toolkit",
        images: [
            {
                url: "https://pdf-toolkit.thirdygayares.com/image/split-pdf-toolkit-by-thirdygayares.jpg",
                width: 1200,
                height: 630,
                alt: "Compare PDFs Online by Thirdy Gayares",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        site: "@thirdygayares",
        title: title,
        description: description,
        images: ["https://pdf-toolkit.thirdygayares.com/image/split-pdf-toolkit-by-thirdygayares.jpg"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function ComparePDFLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
