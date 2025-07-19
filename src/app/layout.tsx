import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Toaster} from "sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL('https://pdf-toolkit.thirdygayares.com'),
    title: {
        "default": 'PDF Toolkit | Secure, Unlimited PDF Tools by Thirdy Gayares',
        "template": '%s | Thirdy Gayares',
    },
    description:
        'PDF Toolkit by Thirdy Gayares offers free, secure, in-browser PDF merging, splitting, compression, and text extraction—no file uploads, 100% privacy.',
    keywords: [
        'PDF Toolkit',
        'PDF merge',
        'PDF split',
        'PDF compressor',
        'PDF text extractor',
        'secure PDF tools',
        'online PDF tools',
        'Thirdy Gayares'
    ],
    authors: [
        {
            name: 'Thirdy Gayares',
            url: 'https://thirdygayares.com',
        },
    ],
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://pdf-toolkit.thirdygayares.com',
    },
    openGraph: {
        title: 'PDF Toolkit | Secure, Unlimited PDF Tools',
        description:
            'Free PDF merging, splitting, compressing, and text extraction by Thirdy Gayares. No file uploads, total privacy in your browser.',
        url: 'https://pdf-toolkit.thirdygayares.com',
        siteName: 'PDF Toolkit',
        images: [
            {
                url: '/pdf-toolkit-by-thirdygayares.jpg',
                width: 1200,
                height: 630,
                alt: 'PDF Toolkit by Thirdy Gayares',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PDF Toolkit | Secure, Unlimited PDF Tools',
        description:
            'Free PDF merging, splitting, compressing, and text extraction by Thirdy Gayares—all in your browser.',
        images: ['pdf-toolkit-by-thirdygayares.jpg'],
        creator: '@thirdygayares',
    },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script id="ga-init" strategy="afterInteractive">
                {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
      `}
        </Script>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {children}
            <Toaster />
          </body>
    </html>
  );
}
