import type { Metadata } from "next";

const title = "Sign PDF Online – Add Signature, Initials & Stamp | Thirdy Gayares PDF Toolkit";
const description =
    "Upload a PDF and sign it in your browser. Type, draw, or upload a signature, add initials or a company stamp, place and resize it on any page, then download the signed PDF. 100% private—processed on your device.";

export const metadata: Metadata = {
    title: {
        default: title,
        template: "%s | Thirdy Gayares PDF Toolkit",
    },
    description: description,
    keywords: [
        "Sign PDF online",
        "Add signature to PDF",
        "PDF e-signature",
        "Draw signature PDF",
        "Type signature PDF",
        "Company stamp PDF",
        "Fill and sign PDF",
        "Free PDF signature tool",
        "No upload PDF tool",
        "Browser PDF tools",
        "Thirdy Gayares PDF Toolkit",
    ],

    metadataBase: new URL("https://pdf-toolkit.thirdygayares.com"),
    publisher: "Thirdy Gayares",
    authors: [{ name: "Thirdy Gayares", url: "https://thirdygayares.com" }],
    alternates: {
        canonical: "https://pdf-toolkit.thirdygayares.com/sign-pdf",
    },
    openGraph: {
        title: title,
        description: description,
        url: "https://pdf-toolkit.thirdygayares.com/sign-pdf",
        siteName: "Thirdy Gayares PDF Toolkit",
        images: [
            {
                url: "https://pdf-toolkit.thirdygayares.com/image/split-pdf-toolkit-by-thirdygayares.jpg",
                width: 1200,
                height: 630,
                alt: "Sign PDF Online by Thirdy Gayares",
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

export default function SignPDFLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
