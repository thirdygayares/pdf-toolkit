import type { Metadata } from "next";

const title = "PDF to Image Converter Online – Free & Secure | Thirdy Gayares PDF Toolkit";
const description =
    "Convert PDF pages to PNG or JPG in your browser. Select all pages or custom ranges, pick 72/300 DPI, and download one image or a ZIP bundle instantly.";

export const metadata: Metadata = {
    title: {
        default: title,
        template: "%s | Thirdy Gayares PDF Toolkit",
    },
    description,
    keywords: [
        "PDF to image",
        "Convert PDF to PNG",
        "Convert PDF to JPG",
        "PDF page to image",
        "Export PDF pages",
        "PDF image converter",
        "Private PDF converter",
        "Browser PDF tools",
        "Thirdy Gayares PDF Toolkit",
    ],
    metadataBase: new URL("https://pdf-toolkit.thirdygayares.com"),
    publisher: "Thirdy Gayares",
    authors: [{ name: "Thirdy Gayares", url: "https://thirdygayares.com" }],
    alternates: {
        canonical: "https://pdf-toolkit.thirdygayares.com/pdf-to-image",
    },
    openGraph: {
        title,
        description,
        url: "https://pdf-toolkit.thirdygayares.com/pdf-to-image",
        siteName: "Thirdy Gayares PDF Toolkit",
        images: [
            {
                url: "https://pdf-toolkit.thirdygayares.com/image/split-pdf-toolkit-by-thirdygayares.jpg",
                width: 1200,
                height: 630,
                alt: "PDF to image converter by Thirdy Gayares",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        site: "@thirdygayares",
        title,
        description,
        images: ["https://pdf-toolkit.thirdygayares.com/image/split-pdf-toolkit-by-thirdygayares.jpg"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

/**
 * Layout component for the PDF-to-image page that renders its children.
 *
 * @returns The rendered page content passed as `children`.
 */
export default function PdfToImageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}