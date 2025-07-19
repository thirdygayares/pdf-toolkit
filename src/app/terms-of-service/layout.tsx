import { Metadata } from 'next';

export const metadata: Metadata = {
    metadataBase: new URL('https://pdf-toolkit.thirdygayares.com'),
    title: 'PDF Toolkit by Thirdy Gayares | Terms of Service',
    description:
        'By using PDF Toolkit’s free in-browser PDF tools, you agree to our Terms of Service—provided “as is” without warranties, and with no liability for data loss or damages.',
    keywords: [
        'PDF Toolkit',
        'Terms of Service',
        'PDF tools terms',
        'legal',
        'no warranties',
        'usage policy',
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
            'max-snippet': -1,
            'max-image-preview': 'large',
        },
    },
    alternates: {
        canonical: 'https://pdf-toolkit.thirdygayares.com/terms-of-service',
    },
    openGraph: {
        title: 'PDF Toolkit | Terms of Service',
        description:
            'By using PDF Toolkit’s free in-browser PDF tools, you agree to our Terms of Service—provided “as is” without warranties, and with no liability for data loss or damages.',
        url: 'https://pdf-toolkit.thirdygayares.com/terms-of-service',
        siteName: 'PDF Toolkit',
        images: [
            {
                url: '/pdf-toolkit-by-thirdygayares.jpg',
                width: 1200,
                height: 630,
                alt: 'Terms of Service – PDF Toolkit',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PDF Toolkit | Terms of Service',
        description:
            'By using PDF Toolkit’s free in-browser PDF tools, you agree to our Terms of Service—provided “as is” without warranties, and with no liability for data loss or damages.',
        images: ['/pdf-toolkit-by-thirdygayares.jpg'],
        creator: '@thirdygayares',
    },
};

export default function TermsLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
