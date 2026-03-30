// app/head.tsx
export default function Head() {
    const siteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "PDF Toolkit By Thirdy Gayares",
        url: "https://pdf-toolkit.thirdygayares.com",
        description:
            "PDF Toolkit by Thirdy Gayares offers free, secure, in-browser PDF merging, splitting, compression, and text extraction—no file uploads, 100% privacy.",
        potentialAction: {
            "@type": "SearchAction",
            target:
                "https://pdf-toolkit.thirdygayares.com/#tools?tools={search_term_string}",
            "query-input": "required name=search_term_string",
        },
    };

    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "PDF Toolkit By Thirdy Gayares",
        url: "https://pdf-toolkit.thirdygayares.com",
        logo: "https://pdf-toolkit.thirdygayares.com/favicon.ico",
        sameAs: [
            "https://github.com/thirdygayares",
            "https://twitter.com/thirdygayares",
            "https://linkedin.com/in/thirdygayares",
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(siteSchema),
                }}
            />
        </>
    );
}
