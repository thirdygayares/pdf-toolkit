import { FileText } from "lucide-react";

export const ExtractTextHeader: React.FC = () => (
    <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">
                    PDF Text Extractor
                </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Extract readable text from PDF files instantly. No uploads, completely
                private processing in your browser.
            </p>
        </div>
    </div>
);
