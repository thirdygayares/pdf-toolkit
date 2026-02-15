import { Download, Settings2, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
    {
        id: "01",
        title: "Upload",
        description: "Drag and drop your PDF files into the tool. No sign-up and no waiting queue.",
        icon: Upload,
    },
    {
        id: "02",
        title: "Choose tool",
        description: "Pick merge, split, extract text, or image extraction and set your preferred options.",
        icon: Settings2,
    },
    {
        id: "03",
        title: "Download",
        description: "Get the processed file right away and continue with your workflow.",
        icon: Download,
    },
]

export const HowItWorksSection = () => {
    return (
        <section id="how-it-works" className="py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <Badge variant="secondary" className="mb-4 border-border/70 bg-surface px-3 py-1 text-xs font-semibold">
                        How it works
                    </Badge>
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Three steps from PDF to done</h2>
                    <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                        The workflow is intentionally simple: upload, choose a tool, and download your result.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {steps.map((step) => {
                        const Icon = step.icon
                        return (
                            <Card
                                key={step.id}
                                className="rounded-2xl border-border/80 bg-card/95 py-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <CardHeader className="space-y-3 border-b border-border/70 pb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-2 text-xs font-semibold text-primary">
                                            {step.id}
                                        </span>
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">{step.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 text-sm leading-relaxed text-muted-foreground">{step.description}</CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
