import Link from "next/link"
import { ArrowRight, FileText, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { heroData } from "@/data/hero"

export const HeroSection = () => {
    return (
        <section className="relative py-24 lg:py-32 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-gradient-to-l from-secondary/10 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[300px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-2xl"></div>
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div className="mb-8">
                        <Badge
                            variant="secondary"
                            className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Professional PDF Tools
                        </Badge>
                    </div>

                    {/* Main Content */}
                    <div className="mb-12">
                        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight tracking-tight">
                            {heroData.title}
                        </h1>
                        <div className="relative">
                            <h2 className="text-2xl md:text-3xl text-primary font-semibold mb-6 relative z-10">
                                {heroData.subtitle}
                            </h2>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent blur-xl rounded-full"></div>
                        </div>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">{heroData.description}</p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                        <Button
                            asChild
                            size="lg"
                            className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Link href={heroData.primaryButton.href} className="flex items-center space-x-3">
                                <Zap className="h-5 w-5" />
                                <span>{heroData.primaryButton.text}</span>
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="text-lg px-8 py-6 h-auto border-2 hover:bg-accent/50 bg-transparent"
                        >
                            <Link href={heroData.secondaryButton.href} className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>{heroData.secondaryButton.text}</span>
                            </Link>
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-2">2+</div>
                            <div className="text-sm text-muted-foreground">Active Tools</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-2">100%</div>
                            <div className="text-sm text-muted-foreground">Free to Use</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-2">4+</div>
                            <div className="text-sm text-muted-foreground">Coming Soon</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
