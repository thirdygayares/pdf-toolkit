import Link from "next/link"
import type { ComponentType } from "react"
import { ArrowRight, Clock3, Sparkles } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { tools } from "@/data/tools"

export const ToolsCatalog = () => {
    const getIcon = (iconName: string) => {
        const IconComponent = (LucideIcons as Record<string, ComponentType<{ className?: string }>>)[iconName]
        return IconComponent ? <IconComponent className="h-5 w-5" /> : <LucideIcons.FileText className="h-5 w-5" />
    }

    const availableTools = tools.filter((tool) => tool.available)
    const comingSoonTools = tools.filter((tool) => !tool.available).slice(0, 2)
    const popularTools = [...availableTools, ...comingSoonTools].slice(0, 100)

    return (
        <section id="tools" className="relative py-16 sm:py-20 lg:py-24">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface via-background to-background" />

            <div className="container mx-auto px-4">
                <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
                    <Badge variant="secondary" className="mb-4 border-border/70 bg-surface px-3 py-1 text-xs font-semibold">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Popular tools
                    </Badge>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                        Start with the most-used PDF actions
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
                        Open a tool and finish your task in minutes. Merge, split, extract text, and pull images without signing up.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                    {popularTools.map((tool) => (
                        <Card
                            key={tool.id}
                            className={`group h-full rounded-2xl border-border/80 bg-card/95 py-0 shadow-sm transition-all duration-200 ${
                                tool.available
                                    ? "hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                                    : "border-dashed opacity-90"
                            }`}
                        >
                            <CardHeader className="space-y-3 border-b border-border/70 pb-4 sm:space-y-4 py-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="inline-flex rounded-lg border border-border/80 bg-surface p-2.5 text-primary">
                                        {getIcon(tool.icon)}
                                    </div>
                                    {tool.available ? (
                                        <Badge className="border-success/35 bg-success/15 text-success">Available</Badge>
                                    ) : (
                                        <Badge className="border-warning/35 bg-warning/15 text-warning">
                                            <Clock3 className="h-3 w-3" />
                                            Coming soon
                                        </Badge>
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl/none lg:text-xl">{tool.name}</CardTitle>
                                    <CardDescription className="mt-2 line-clamp-3 text-sm leading-relaxed sm:text-base lg:text-sm">
                                        {tool.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="mt-auto pt-4 pb-5">
                                {tool.available ? (
                                    <Button asChild className="h-10 w-full justify-center rounded-lg text-sm font-semibold sm:h-11">
                                        <Link href={tool.href!}>
                                            Open
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        disabled
                                        variant="outline"
                                        className="h-10 w-full rounded-lg border-border bg-surface text-sm text-muted-foreground sm:h-11"
                                    >
                                        Coming soon
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
