import { Archive, Briefcase, ImagePlus, Receipt, ScanSearch, Shield } from "lucide-react";

const useCases = [
    {
        title: "Contracts & Legal PDFs",
        description: "Pull embedded signatures, seals, and annex images from long legal PDFs without exporting every page.",
        icon: Briefcase,
    },
    {
        title: "Scanned Reports",
        description: "Extract charts, screenshots, and evidence images for presentations, QA review, or documentation.",
        icon: ScanSearch,
    },
    {
        title: "Marketing Asset Recovery",
        description: "Reuse product photos or banners embedded in campaign PDFs and proposals without manual screenshots.",
        icon: ImagePlus,
    },
    {
        title: "Invoices & Receipts",
        description: "Capture logos, stamps, and attached image artifacts from accounting PDFs for audit trails.",
        icon: Receipt,
    },
    {
        title: "Batch ZIP Export",
        description: "Upload multiple PDFs, review extracted images in one list, then export selected images as a clean ZIP package.",
        icon: Archive,
    },
    {
        title: "Privacy-first Internal Work",
        description: "Process sensitive PDFs locally in the browser when images should not be uploaded to an external server.",
        icon: Shield,
    },
];

export const UseCasesSection = () => {
    return (
        <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 lg:p-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Use cases</h2>
                    <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                        Common ways teams use the PDF Extract Image tool in a local-only workflow.
                    </p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {useCases.map((item) => {
                    const Icon = item.icon;
                    return (
                        <article key={item.title} className="rounded-xl border border-border/80 bg-surface/45 p-4">
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/80 bg-background text-primary">
                                <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground sm:text-base">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};
