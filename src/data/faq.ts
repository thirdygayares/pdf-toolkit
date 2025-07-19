export interface FAQ {
    question: string
    answer: string
}

export const faqData: FAQ[] = [
    {
        question: "Is my data secure when using your tools?",
        answer:
            "Yes, absolutely. All file processing happens locally in your browser or on secure servers. We never store your files permanently, and all data is automatically deleted after processing.",
    },
    {
        question: "What file formats do you support?",
        answer:
            "We primarily work with PDF files, but our conversion tools support various formats including Word documents, and image formats like JPG and PNG.",
    },
    {
        question: "Is there a file size limit?",
        answer:
            "For optimal performance, we recommend files under 100MB. However, our tools can handle larger files depending on your device capabilities and internet connection.",
    },
    {
        question: "Do I need to create an account?",
        answer:
            "No account required! All our tools are available for immediate use without registration. Simply upload your files and start processing.",
    },
    {
        question: "Are the tools free to use?",
        answer:
            "Yes, our basic tools are completely free. We may introduce premium features in the future for advanced functionality and higher processing limits.",
    },
    {
        question: "Can I use these tools on mobile devices?",
        answer:
            "Yes, our tools are fully responsive and work on all devices including smartphones and tablets. The interface adapts to your screen size for optimal usability.",
    },
]
