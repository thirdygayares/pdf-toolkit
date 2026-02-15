export interface NavigationItem {
    name: string
    href: string
    children?: NavigationItem[]
}

export const navigation: NavigationItem[] = [
    { name: "Home", href: "/" },
    {
        name: "Tools",
        href: "/#tools",
        children: [
            { name: "Merge PDF", href: "/merge-pdf" },
            { name: "Extract Text", href: "/pdf-extract-text" },
            { name: "Split PDF", href: "/split-pdf" },
            { name: "Extract Image", href: "/pdf-extract-image" },
            { name: "Compress PDF", href: "#" },
            { name: "Convert PDF", href: "#" },
            { name: "Protect PDF", href: "#" },
        ],
    },
    { name: "How it works", href: "/#how-it-works" },
    { name: "FAQ", href: "/#faq" },
]
