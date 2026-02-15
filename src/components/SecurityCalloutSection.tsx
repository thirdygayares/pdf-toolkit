import Link from "next/link"
import { Lock, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const highlights = [
    "Files are processed in-browser for core tools",
    "No mandatory account creation",
    "Fast local processing with minimal friction",
]

export const SecurityCalloutSection = () => {
    return (
        <section id="privacy" className="pb-20 sm:pb-24">
            <div className="container mx-auto px-4">
                <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-surface via-card to-card p-6 sm:p-10">
                    <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />

                    <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                Security and privacy
                            </div>
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Keep control of your documents while you work
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                PDF Toolkit is designed for privacy-first usage. Open a tool, process your files quickly, and
                                download the result without unnecessary handoffs.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Button asChild variant="outline" className="rounded-lg border-border bg-background/80">
                                    <Link href="/privacy-policy">Privacy Policy</Link>
                                </Button>
                                <Button asChild variant="secondary" className="rounded-lg">
                                    <Link href="/#tools">Browse tools</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border/80 bg-card/95 p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Lock className="h-4 w-4 text-primary" />
                                Trust highlights
                            </div>
                            <ul className="space-y-3">
                                {highlights.map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
