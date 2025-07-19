import Link from "next/link"
import { Lock, Clock, ArrowRight, Sparkles } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { tools } from "@/data/tools"

export const ToolsCatalog = () => {
    const getIcon = (iconName: string) => {
        const IconComponent = (LucideIcons as any)[iconName]
        return IconComponent ? <IconComponent className="h-8 w-8" /> : <LucideIcons.FileText className="h-8 w-8" />
    }

    return (
        <section id="tools" className="py-24 relative">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background"></div>

            <div className="container mx-auto px-4 relative">
                <div className="text-center mb-20">
                    <Badge
                        variant="secondary"
                        className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20 mb-6"
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Tools Collection
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">Professional PDF Tools</h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Comprehensive suite of PDF tools designed to handle all your document processing needs with
                        professional-grade quality and performance.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {tools.map((tool, index) => (
                        <Card
                            key={tool.id}
                            className={`group relative transition-all duration-500 hover:shadow-2xl ${
                                tool.available
                                    ? "hover:shadow-primary/20 border-primary/20 hover:border-primary/40 hover:-translate-y-2"
                                    : "opacity-75 hover:opacity-90"
                            } ${index % 2 === 0 ? "lg:mt-8" : ""}`}
                        >
                            {/* Gradient overlay for available tools */}
                            {tool.available && (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            )}

                            <CardHeader className="pb-4 relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className={`p-4 rounded-xl transition-all duration-300 ${
                                            tool.available
                                                ? "bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {getIcon(tool.icon)}
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        {!tool.available && <Lock className="h-5 w-5 text-muted-foreground" />}
                                        {tool.comingSoon && (
                                            <Badge
                                                variant="secondary"
                                                className="flex items-center space-x-1 bg-orange-100 text-orange-700 border-orange-200"
                                            >
                                                <Clock className="h-3 w-3" />
                                                <span>Coming Soon</span>
                                            </Badge>
                                        )}
                                        {tool.available && (
                                            <Badge className="bg-green-100 text-green-700 border-green-200">Available</Badge>
                                        )}
                                    </div>
                                </div>
                                <CardTitle
                                    className={`text-xl mb-2 transition-colors ${
                                        tool.available ? "text-foreground group-hover:text-primary" : "text-muted-foreground"
                                    }`}
                                >
                                    {tool.name}
                                </CardTitle>
                                <CardDescription className="text-sm leading-relaxed">{tool.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 relative">
                                {tool.available ? (
                                    <Button
                                        asChild
                                        className="w-full group/btn bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300"
                                    >
                                        <Link href={tool.href!} className="flex items-center justify-center space-x-2">
                                            <span>Use Tool</span>
                                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button disabled className="w-full bg-muted text-muted-foreground">
                                        Coming Soon
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
