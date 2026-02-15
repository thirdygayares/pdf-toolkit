import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react"

export function Hero() {
    const features = [
        "Combine multiple PDF files into one document",
        "Drag and drop to reorder pages before final merge",
        "Files are processed in your browser for privacy-first usage",
    ]

    return (
        <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 lg:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Merge PDF Tool
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Merge PDF files online without uploading to a server
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Use this free PDF merger to combine files quickly, reorder pages before exporting, and download a single
                final PDF in seconds.
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
                Popular search intent covered: merge PDF online, free PDF combiner, secure browser PDF merge.
            </p>
        </section>
    )
}
