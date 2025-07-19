export interface Tool {
    id: string
    name: string
    description: string
    icon: string
    available: boolean
    comingSoon?: boolean
    href?: string
}

export const tools: Tool[] = [
    {
        id: "merge",
        name: "Merge PDF",
        description: "Combine multiple PDF files into a single document with ease.",
        icon: "FileText",
        available: true,
        href: "/merge-pdf",
    },
    {
        id: "extract",
        name: "Extract Text",
        description: "Extract text content from PDF files quickly and accurately.",
        icon: "FileSearch",
        available: true,
        href: "/pdf-extract-text",
    },
    {
        id: "split",
        name: "Split PDF",
        description: "Split large PDF files into smaller, manageable documents.",
        icon: "Scissors",
        available: false,
        comingSoon: true,
    },
    {
        id: "compress",
        name: "Compress PDF",
        description: "Reduce PDF file size while maintaining quality.",
        icon: "Archive",
        available: false,
        comingSoon: true,
    },
    {
        id: "convert",
        name: "Convert PDF",
        description: "Convert PDF files to various formats like Word, Excel, and more.",
        icon: "RefreshCw",
        available: false,
        comingSoon: true,
    },
    {
        id: "protect",
        name: "Protect PDF",
        description: "Add password protection and security to your PDF files.",
        icon: "Shield",
        available: false,
        comingSoon: true,
    },
]
