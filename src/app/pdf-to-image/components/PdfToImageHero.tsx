import { Check } from "lucide-react";

export const PdfToImageHero = () => {
    const features = [
        "Upload one or many PDFs, then reorder files before conversion",
        "Drag pages to reorder output and select exactly what you need",
        "Use 72 DPI for web or 300 DPI for print-quality exports",
        "Download one image instantly or bundle many pages as ZIP",
    ];

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-4xl font-bold text-foreground lg:text-5xl">PDF to Image converter</h1>
                <p className="text-lg text-muted-foreground">
                    Follow the split-style workflow: upload, reorder, preview, select, then export pages as JPG or PNG.
                </p>
            </div>

            <div className="space-y-4">
                {features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                            <Check className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-foreground">{feature}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
