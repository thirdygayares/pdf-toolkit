import { Check } from "lucide-react"

export function Hero() {
    const features = [
        "Join separate PDFs into one single file",
        "Reorder or delete unneeded pages",
        "We are not saving your PDF. All files stay on your browser only."
    ]

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-navy-900">Merge PDF in seconds</h1>
                <p className="text-lg text-navy-700 leading-relaxed">
                    Combine multiple PDF files into a single document without installing any software
                </p>
            </div>

            <div className="space-y-4">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-navy-700">{feature}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
