import { Check } from "lucide-react"

export const SplitHero = () => {
    const features = [
        "Select exactly which pages to keep",
        "Preview layout with 1–5 columns",
        "Private: processed in your browser",
    ]

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground">Split PDF in seconds</h1>
                <p className="text-lg text-muted-foreground">
                    Upload a single PDF, choose the pages to keep, and download the new file instantly.
                </p>
            </div>

            <div className="space-y-4">
                {features.map((f) => (
                    <div className="flex items-start gap-3" key={f}>
                        <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-foreground">{f}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
