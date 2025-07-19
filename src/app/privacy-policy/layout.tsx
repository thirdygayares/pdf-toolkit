import { Metadata } from 'next';

export const metadata: Metadata = {
    metadataBase: new URL('https://pdf-toolkit.thirdygayares.com'),
    title: 'PDF Toolkit by Thirdy Gayares | Privacy Policy',
    description:
        'Learn how PDF Toolkit handles your data: all PDF processing happens locally in your browser, files are never stored on our servers, and are deleted immediately after use.',
    keywords: [
        'PDF Toolkit',
        'Privacy Policy',
        'data privacy',
        'local processing',
        'no file uploads',
        'browser PDF tools'
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
            'max-snippet': -1,
            'max-image-preview': 'large',
        },
    },
    alternates: {
        canonical: 'https://pdf-toolkit.thirdygayares.com/privacy-policy',
    },
    openGraph: {
        title: 'PDF Toolkit | Privacy Policy',
        description:
            'All PDF operations with PDF Toolkit happen entirely in your browser—no files are uploaded or stored on our servers, and every document is erased once processed.',
        url: 'https://pdf-toolkit.thirdygayares.com/privacy-policy',
        siteName: 'PDF Toolkit',
        images: [
            {
                url: '/pdf-toolkit-by-thirdygayares.jpg',
                width: 1200,
                height: 630,
                alt: 'Privacy Policy – PDF Toolkit',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PDF Toolkit | Privacy Policy',
        description:
            'All PDF operations with PDF Toolkit happen entirely in your browser—no files are uploaded or stored on our servers.',
        images: ['/pdf-toolkit-by-thirdygayares.jpg'],
        creator: '@thirdygayares',
    },
};

export default function PrivacyPolicyLayout({
                                                children,
                                            }: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
