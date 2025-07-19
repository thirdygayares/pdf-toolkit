import { Metadata } from 'next';

export const metadata: Metadata = {
    metadataBase: new URL('https://pdf-toolkit.thirdygayares.com'),
    title: 'PDF Toolkit by Thirdy Gayares | Cookie Policy',
    description:
        'Our Cookie Policy explains how we use cookies to remember your preferences and improve functionality. We do not use cookies for advertising.',
    keywords: [
        'PDF Toolkit',
        'Cookie Policy',
        'cookies',
        'browser settings',
        'user preferences',
        'privacy'
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
        canonical: 'https://pdf-toolkit.thirdygayares.com/cookie-policy',
    },
    openGraph: {
        title: 'PDF Toolkit | Cookie Policy',
        description:
            'We use cookies only to remember your preferences and improve tool functionality—no advertising cookies are used.',
        url: 'https://pdf-toolkit.thirdygayares.com/cookie-policy',
        siteName: 'PDF Toolkit',
        images: [
            {
                url: '/pdf-toolkit-by-thirdygayares.jpg',
                width: 1200,
                height: 630,
                alt: 'Cookie Policy – PDF Toolkit',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PDF Toolkit | Cookie Policy',
        description:
            'We use cookies only to remember your preferences and improve tool functionality—no advertising cookies are used.',
        images: ['/pdf-toolkit-by-thirdygayares.jpg'],
        creator: '@thirdygayares',
    },
};

export default function CookiePolicyLayout({
                                               children,
                                           }: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
