import type { Metadata } from "next"

const title = "Image to PDF Converter Online – Free & Secure | Thirdy Gayares PDF Toolkit"
const description =
    "Convert multiple images into one PDF in your browser. Configure A4/Letter/custom page size, background color, margins, layout, reorder images, and download instantly."

export const metadata: Metadata = {
    title: {
        default: title,
        template: "%s | Thirdy Gayares PDF Toolkit",
    },
    description,
    keywords: [
        "Image to PDF",
        "JPG to PDF",
        "PNG to PDF",
        "Convert images to PDF",
        "A4 image to PDF",
        "Custom size image PDF",
        "Browser image to PDF",
        "Private image converter",
        "PDF toolkit",
        "Thirdy Gayares",
    ],
    metadataBase: new URL("https://pdf-toolkit.thirdygayares.com"),
    publisher: "Thirdy Gayares",
    authors: [{ name: "Thirdy Gayares", url: "https://thirdygayares.com" }],
    alternates: {
        canonical: "https://pdf-toolkit.thirdygayares.com/image-pdf",
    },
    openGraph: {
        title,
        description,
        url: "https://pdf-toolkit.thirdygayares.com/image-pdf",
        siteName: "Thirdy Gayares PDF Toolkit",
        images: [
            {
                url: "https://pdf-toolkit.thirdygayares.com/image/merge-pdf-toolkit-by-thirdygayares.jpg",
                width: 1200,
                height: 630,
                alt: "Image to PDF Converter by Thirdy Gayares",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        site: "@thirdygayares",
        title,
        description,
        images: ["https://pdf-toolkit.thirdygayares.com/image/merge-pdf-toolkit-by-thirdygayares.jpg"],
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function ImagePdfLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>
}
