import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
        <Badge className="mb-4 w-fit border-primary/20 bg-primary/10 text-primary">
            Extract Text Tool
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Extract text from PDFs in seconds
        </h2>
        <p className="mt-4 text-muted-foreground sm:text-lg">
            Convert PDF content into plain, selectable text for easy copying, analysis, or conversion.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map(({ title, desc }) => (
                <div key={title} className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface/45 px-3 py-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success/15">
                        <CheckCircle className="h-3.5 w-3.5 text-success" />
                    </div>
                    <div>
                        <p className="font-medium text-foreground">{title}</p>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                </div>
            ))}
        </div>
    </section>
);
