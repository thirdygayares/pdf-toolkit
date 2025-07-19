import type {Metadata} from "next";

export const metadata: Metadata = {
    title: {
        default: "PDF Text Extractor – Free & Secure | Thirdy Gayares PDF Toolkit",
        template: "%s | Thirdy Gayares",
    },
    description:
        "Extract selectable text from any text-based PDF in seconds—100% client-side, no uploads. Privacy-first PDF text extraction built with Next.js & TailwindCSS.",
    keywords: [
        "PDF text extractor",
        "Extract text from PDF",
        "PDF to text",
        "Client-side PDF processing",
        "No upload PDF tool",
        "Private PDF text extraction",
        "Free PDF extractor",
        "Thirdy Gayares PDF Toolkit",
    ],
    metadataBase: new URL("https://pdf-toolkit.thirdygayares.com"),
    alternates: {
        canonical: "https://pdf-toolkit.thirdygayares.com/pdf-extract-text",
    },
    openGraph: {
        title: "PDF Text Extractor | Thirdy Gayares PDF Toolkit",
        description:
            "Instantly pull plain text out of your PDFs right in the browser. No server uploads, completely private.",
        url: "https://pdf-toolkit.thirdygayares.com/pdf-extract-text",
        siteName: "Thirdy Gayares PDF Toolkit",
        images: [
            {
                url: "https://pdf-toolkit.thirdygayares.com/image/extract-text-toolkit-by-thirdygayares.jpg",
                width: 1200,
                height: 630,
                alt: "PDF Text Extractor by Thirdy Gayares",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        site: "@thirdygayares",
        creator: "@thirdygayares",
        title: "PDF Text Extractor – Private & Secure",
        description:
            "Extract readable text from any text-based PDF directly in your browser—no uploads.",
        images: [
            "https://pdf-toolkit.thirdygayares.com/image/extract-text-toolkit-by-thirdygayares.jpg",
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function PDFExtractTextLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <>{children}
      </>
  );
}
