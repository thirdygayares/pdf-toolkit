import { FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const MarkdownPdfHeader: React.FC = () => (
    <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <FileCode className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">
                    Markdown to PDF
                </h1>
                <Badge variant="secondary" className="ml-1">
                    Coming Soon
                </Badge>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Convert Markdown documents into publication-ready PDFs with syntax
                highlighting, Mermaid diagrams, KaTeX math, and precise page layout
                controls—all in your browser.
            </p>
        </div>
    </div>
);
