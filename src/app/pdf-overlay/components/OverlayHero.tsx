export const OverlayHero = () => {
    return (
        <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                Overlay PDFs in one flow
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Overlay PDF Documents
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Combine a base PDF and an overlay PDF on a single page workflow. Great for letterheads, branded templates, repeating stamps, and page-by-page overlays.
            </p>
        </div>
    )
}
