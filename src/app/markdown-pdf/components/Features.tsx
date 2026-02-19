import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

const FEATURES = [
    "Live editor with instant multi-page preview",
    "Syntax-highlighted code blocks via fenced markdown",
    "KaTeX-style math notation support",
    "Manual page break markers for precise control",
    "Task lists and tables rendered cleanly",
    "Browser-only processing for private documents",
];

export const Features: React.FC = () => (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-50 via-white to-cyan-50/50 p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-sky-100/50 blur-3xl" />

        <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/90 px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Markdown to PDF Tool
            </div>

            <h1 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Publication-ready PDFs from Markdown
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Draft in plain Markdown, tune the visual style, and export polished PDF pages without uploading your content to any server.
            </p>

            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {FEATURES.map((feature) => (
                    <div key={feature} className="inline-flex items-start gap-2 rounded-lg border border-border/70 bg-white/80 px-3 py-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <p className="text-sm text-foreground">{feature}</p>
                    </div>
                ))}
            </div>

            <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Popular search intent: Markdown to PDF online, MD to PDF converter, secure browser-based export.
            </p>
        </div>
    </section>
);
