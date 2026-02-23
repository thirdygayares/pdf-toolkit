import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export const ExtractHero = () => {
    const features = [
        "Extract embedded images from one or multiple PDFs directly in your browser",
        "Preview images first, zoom in, and delete what you don't need",
        "Download one-by-one or batch everything into a ZIP",
        "No server upload required for the extraction flow",
    ];

    return (
        <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 lg:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                PDF Extract Image Tool
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Extract images from PDF with a single-page workflow
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Upload one or multiple PDFs, extract images locally in your browser, review the results, and export only the images you want.
            </p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {features.map((feature) => (
                    <div key={feature} className="inline-flex items-start gap-2 rounded-lg border border-border/70 bg-surface/60 px-3 py-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <p className="text-sm text-foreground">{feature}</p>
                    </div>
                ))}
            </div>

            <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Privacy-first flow: PDF stays on your device while extracting images.
            </p>
        </section>
    );
};
