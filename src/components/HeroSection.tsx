import Link from "next/link"
import { ArrowRight, CheckCircle2, FileUp, Lock, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { heroData } from "@/data/hero"

const previewTools = [
    { name: "Merge PDF", icon: Sparkles },
    { name: "Extract Text", icon: Zap },
    { name: "Split PDF", icon: FileUp },
]

const workflowSteps = [
    "Upload your PDF files",
    "Choose the tool and options",
    "Download your result",
]

export const HeroSection = () => {
    return (
        <section className="relative overflow-hidden border-b border-border/70 py-16 sm:py-20 lg:py-24">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-x-0 top-[-220px] h-[520px] bg-[radial-gradient(circle_at_top,var(--semantic-primary)_0%,transparent_72%)] opacity-[0.18]" />
                <div className="absolute inset-0 surface-grid opacity-15 [mask-image:radial-gradient(circle_at_top,black,transparent_72%)]" />
            </div>

            <div className="container mx-auto px-4">
                <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="max-w-2xl">
                        <Badge
                            variant="secondary"
                            className="mb-6 border-border/70 bg-surface px-4 py-2 text-sm font-medium text-foreground"
                        >
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Privacy-first PDF Toolkit
                        </Badge>

                        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            {heroData.title}
                        </h1>
                        <p className="mt-5 text-lg font-medium text-primary">{heroData.subtitle}</p>
                        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{heroData.description}</p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button
                                asChild
                                size="lg"
                                className="h-11 rounded-lg px-6 text-sm font-semibold shadow-sm hover:shadow-md"
                            >
                                <Link href={heroData.primaryButton.href}>
                                    {heroData.primaryButton.text}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-11 rounded-lg border-border bg-background px-6 text-sm font-semibold"
                            >
                                <Link href={heroData.secondaryButton.href}>{heroData.secondaryButton.text}</Link>
                            </Button>
                        </div>

                        <ul className="mt-7 flex flex-wrap gap-2.5">
                            {heroData.trustPoints.map((point) => (
                                <li
                                    key={point}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 via-accent-strong/15 to-transparent blur-2xl" />
                        <div className="relative rounded-2xl border border-border/70 bg-card/95 p-5 shadow-xl backdrop-blur sm:p-6">
                            <div className="flex items-center justify-between border-b border-border/70 pb-4">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">PDF Toolkit</p>
                                    <p className="text-xs text-muted-foreground">Process locally. Download instantly.</p>
                                </div>
                                <Badge className="border-success/30 bg-success/15 text-success">Live</Badge>
                            </div>

                            <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-md bg-primary/15 p-2 text-primary">
                                        <FileUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Drop files here</p>
                                        <p className="text-xs text-muted-foreground">PDF only, processed in browser</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2 rounded-xl border border-border/70 bg-surface p-4">
                                {workflowSteps.map((step, index) => (
                                    <div key={step} className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                                                {index + 1}
                                            </span>
                                            {step}
                                        </div>
                                        <span className="text-xs text-muted-foreground">{index < 2 ? "Done" : "Ready"}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                {previewTools.map((tool) => {
                                    const Icon = tool.icon
                                    return (
                                        <div key={tool.name} className="rounded-xl border border-border/70 bg-card p-3">
                                            <Icon className="mb-2 h-4 w-4 text-primary" />
                                            <p className="text-xs font-medium text-foreground">{tool.name}</p>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/70 bg-surface px-3 py-2 text-xs text-muted-foreground">
                                <Lock className="h-3.5 w-3.5 text-primary" />
                                Files stay on your device unless you choose to share them.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
