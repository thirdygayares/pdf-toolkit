
module.exports = {
    siteUrl: "https://pdf-toolkit.thirdygayares.com",
    generateRobotsTxt: true,
    changefreq: 'monthly',
    priority: 0.5,
    sitemapSize: 7000,
    additionalPaths: async () => {
        const now = new Date().toISOString();
        return [
            {
                loc: "/",
                changefreq: "daily",
                priority: 1.0,
                lastmod: now,
            },
            {
                loc: "/pdf-extract-text",
                changefreq: "weekly",
                priority: 0.8,
                lastmod: now,
            },
            {
                loc: "/merge-pdf",
                changefreq: "weekly",
                priority: 0.8,
                lastmod: now,
            },
        ]
    }
};