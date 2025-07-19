import { CheckCircle } from "lucide-react";

const items = [
    {
        title: "Extract text from any text-based PDF",
        desc: "Perfect for reports, contracts, and documents",
    },
    {
        title: "Copy or download extracted text",
        desc: "Get your text in the format you need",
    },
    {
        title: "100% private and secure",
        desc: "All processing happens in your browser",
    },
];

export const Features: React.FC = () => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
                Extract text from PDFs in seconds
            </h2>
            <p className="text-muted-foreground mb-6">
                Convert PDF content into plain, selectable text for easy copying,
                analysis, or conversion.
            </p>
            <div className="space-y-4">
                {items.map(({ title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                            <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{title}</p>
                            <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
