import { Check } from "lucide-react";

export const ExtractHero = () => {
    const features = [
        "Extract all embedded images from a PDF",
        "Default: all images selected",
        "Download Selected (zip) or Download All (zip)",
        "Per-image download without zipping",
    ];

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground">Extract images in seconds</h1>
                <p className="text-lg text-muted-foreground">
                    Upload a PDF (≤ 20MB). Preview thumbnails, pick the ones you need, and download instantly.
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
    );
};
