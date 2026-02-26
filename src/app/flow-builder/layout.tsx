import type { Metadata } from "next"
import "@xyflow/react/dist/style.css"

export const metadata: Metadata = {
    title: "PDF Flow Builder",
    description: "Build reusable batch PDF workflows in your browser with a visual node-based flow builder.",
    alternates: {
        canonical: "https://pdf-toolkit.thirdygayares.com/flow-builder",
    },
}

export default function FlowBuilderLayout({ children }: { children: React.ReactNode }) {
    return children
}
