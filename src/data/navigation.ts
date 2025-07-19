export interface NavigationItem {
    name: string
    href: string
    children?: NavigationItem[]
}

export const navigation: NavigationItem[] = [
    { name: "Home", href: "/" },
    {
        name: "Tools",
        href: "#tools",
        children: [
            { name: "Merge PDF", href: "/merge-pdf" },
            { name: "Extract Text", href: "/pdf-extract-text" },
            { name: "Split PDF", href: "#" },
            { name: "Compress PDF", href: "#" },
            { name: "Convert PDF", href: "#" },
            { name: "Protect PDF", href: "#" },
        ],
    },
    { name: "About", href: "/#about" },
    { name: "FAQ", href: "/#faq" },
]
