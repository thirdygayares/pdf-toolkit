import type {Metadata} from "next";


export const metadata: Metadata = {
    title: {
        default: "Merge PDF Files Online – Free & Secure | Thirdy Gayares PDF Toolkit",
        template: "%s | Thirdy Gayares",
    },
    description:
        "Merge multiple PDF files into one document securely, directly in your browser. No uploads, no limits. Built with Next.js and TailwindCSS by Thirdy Gayares.",
    keywords: [
        "Merge PDF",
        "PDF combiner",
        "Merge PDF online",
        "Free PDF merge tool",
        "Secure PDF merge",
        "Unlimited PDF merger",
        "PDF toolkit",
        "Thirdy Gayares",
        "Next.js PDF tool",
        "Browser PDF merge",
        "React PDF utility",
        "TailwindCSS UI",
        "No upload PDF tool",
        "Open-source PDF merge",
        "Privacy first PDF merge",
    ],
    metadataBase: new URL("https://pdf-toolkit.thirdygayares.com"),
    publisher: "Thirdy Gayares",
    authors: [
        { name: "Thirdy Gayares", url: "https://thirdygayares.com" },
    ],
    alternates: {
        canonical: "https://pdf-toolkit,thirdygayares.com/merge-pdf",
    },
    openGraph: {
        title: "Free & Secure PDF Merger | Merge Files in Your Browser",
        description:
            "Combine PDFs in seconds. This browser-based PDF merger ensures 100% privacy – your files never leave your device.",
        url: "https://pdf-toolkit.thirdygayares.com/merge-pdf",
        siteName: "Thirdy Gayares PDF Toolkit",
        images: [
            {
                url: "https://pdf-toolkit.thirdygayares.com/image/merge-pdf-toolkit-by-thirdygayares.jpg",
                width: 1200,
                height: 630,
                alt: "Merge PDF Files Online by Thirdy Gayares",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        site: "@thirdygayares",
        title: "Merge PDF Files Securely – No Upload Required",
        description: "A free browser-based PDF merging tool built with Next.js and Tailwind. Created by Thirdy Gayares.",
        images: ["https://pdf-toolkit.thirdygayares.com/image/merge-pdf-toolkit-by-thirdygayares.jpg"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function MergePDFLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <>{children}
      </>
  );
}
