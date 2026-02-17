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
        available: true,
        href: "/split-pdf",
    },
    {
        id: "extract-image",
        name: "Extract Image",
        description: "Extract all embedded images from PDFs",
        icon: "Image",
        available: true,
        href: "/pdf-extract-image",
    },
    {
        id: "pdf-to-image",
        name: "PDF to Image",
        description: "Convert full PDF pages into JPG or PNG files with DPI controls.",
        icon: "ImagePlus",
        available: true,
        href: "/pdf-to-image",
    },
    {
        id: "image-pdf",
        name: "Image to PDF",
        description: "Combine multiple images into one PDF with page setup controls.",
        icon: "Images",
        available: true,
        href: "/image-pdf",
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
