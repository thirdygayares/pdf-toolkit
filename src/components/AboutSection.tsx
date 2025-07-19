import * as LucideIcons from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { aboutData } from "@/data/about"

export const AboutSection = () => {
    const getIcon = (iconName: string) => {
        const IconComponent = (LucideIcons as any)[iconName]
        return IconComponent ? <IconComponent className="h-6 w-6" /> : <LucideIcons.FileText className="h-6 w-6" />
    }

    return (
        <section id="about" className="py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{aboutData.title}</h2>
                        <p className="text-xl text-primary font-semibold mb-6">{aboutData.subtitle}</p>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">{aboutData.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {aboutData.features.map((feature, index) => (
                            <Card
                                key={index}
                                className="text-center border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                            >
                                <CardHeader className="pb-4">
                                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                                        {getIcon(feature.icon)}
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
