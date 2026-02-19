import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
    "Split-screen editor with live structural preview",
    "Syntax-highlighted code blocks via triple-backtick fences",
    "Mermaid.js flowcharts rendered as vector graphics",
    "KaTeX math — inline $ ... $ and display $$ ... $$",
    "Page break controls with <!-- pagebreak --> or \\newpage",
    "Widow / orphan control keeps headings with their paragraphs",
];

export const Features: React.FC = () => (
    <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Markdown to PDF Tool
            </div>
            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Publication-ready PDFs from Markdown
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Write technical manuals, academic papers, or eBooks in plain Markdown and export
            polished PDFs with one click — no server uploads, completely private.
        </p>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {FEATURES.map((feature) => (
                <div
                    key={feature}
                    className="inline-flex items-start gap-2 rounded-lg border border-border/70 bg-surface/60 px-3 py-2.5"
                >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <p className="text-sm text-foreground">{feature}</p>
                </div>
            ))}
        </div>

        <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Popular search intent: Markdown to PDF online, MD to PDF converter, Mermaid diagram PDF export.
        </p>
    </section>
);
