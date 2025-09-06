import type { Metadata } from "next";

const title = "Extract Images from PDF Online – Free & Secure | Thirdy Gayares PDF Toolkit";
const description = "Upload a PDF (≤20MB) and instantly extract all embedded images. Preview thumbnails, select what you need, and download per-image or as a zip. 100% private—processed in your browser.";


export const metadata: Metadata = {
    title: {
        default: title,
        template: "%s | Thirdy Gayares PDF Toolkit",
    },
    description: description,
    keywords: [
        "Extract images from PDF",
        "PDF image extractor",
        "Download PDF images",
        "Export images from PDF",
        "Free PDF image tool",
        "Secure PDF image extraction",
        "No upload PDF tool",
        "Browser PDF tools",
        "Thirdy Gayares PDF Toolkit",
        "Private PDF image extractor",
    ],

    metadataBase: new URL("https://pdf-toolkit.thirdygayares.com"),
    publisher: "Thirdy Gayares",
    authors: [{ name: "Thirdy Gayares", url: "https://thirdygayares.com" }],
    alternates: {
        canonical: "https://pdf-toolkit.thirdygayares.com/pdf-extract-image",
    },
    openGraph: {
        title: title,
        description: description,
        url: "https://pdf-toolkit.thirdygayares.com/pdf-extract-image",
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
        title: title,
        description: description,
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
