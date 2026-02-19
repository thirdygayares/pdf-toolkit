import { CheckCircle } from "lucide-react";

const FEATURES = [
    {
        title: "Syntax-highlighted code blocks",
        desc: "Triple-backtick fences with language tags render with full color highlighting.",
    },
    {
        title: "Mermaid.js / PlantUML diagrams",
        desc: "Flowcharts and sequence diagrams are rendered as vector graphics inside the PDF.",
    },
    {
        title: "KaTeX / MathJax equations",
        desc: "Inline $ ... $ and display $$ ... $$ math render correctly for academic papers.",
    },
    {
        title: "GitHub Flavored Markdown (GFM)",
        desc: "Task lists, strikethrough, tables, and auto-linked URLs are fully supported.",
    },
    {
        title: "Page break controls",
        desc: "Insert <!-- pagebreak --> or \\newpage to force content onto the next page.",
    },
    {
        title: "Widow / orphan protection",
        desc: "H1–H3 headings are always kept with the paragraph that follows them.",
    },
];

export const Features: React.FC = () => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
                Publication-ready PDFs from Markdown
            </h2>
            <p className="text-muted-foreground mb-6">
                Write technical manuals, academic papers, or eBooks in plain Markdown
                and export polished PDFs with one click—no server uploads required.
            </p>
            <div className="space-y-4">
                {FEATURES.map(({ title, desc }) => (
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
