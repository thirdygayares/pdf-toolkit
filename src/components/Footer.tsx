import Link from "next/link"
import Image from "next/image"
import { Github, Globe, Linkedin, Youtube } from "lucide-react"
import { footerData } from "@/data/footer"
import { navigation } from "@/data/navigation"
import { tools } from "@/data/tools"

export const Footer = () => {
    const quickLinks = navigation.filter((item) => !item.children)

    return (
        <footer className="border-t border-border/80 bg-surface/45">
            <div className="container mx-auto px-4 py-12 sm:py-14 lg:py-16">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                    <div>
                        <Link href="/" className="mb-5 inline-flex items-center space-x-3">
                            <Image src="/logo.svg" alt="PDF Toolkit" width={36} height={36} className="h-8 w-8 sm:h-9 sm:w-9" />
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-foreground sm:text-xl">PDF Toolkit</span>
                                <span className="text-xs text-muted-foreground -mt-1">Professional tools</span>
                            </div>
                        </Link>
                        <p className="mb-5 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Professional PDF tools for all your document needs. Fast, secure, and easy to use.
                        </p>
                        <div className="flex items-center gap-2">
                            <Link
                                href="https://github.com/thirdygayares"
                                className="rounded-md border border-border/70 p-2 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                                aria-label="GitHub"
                            >
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link
                                href="https://www.youtube.com/@thirdygayares"
                                className="rounded-md border border-border/70 p-2 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                                aria-label="YouTube"
                            >
                                <Youtube className="h-5 w-5" />
                            </Link>
                            <Link
                                href="https://www.linkedin.com/in/thirdygayares/"
                                className="rounded-md border border-border/70 p-2 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-5 w-5" />
                            </Link>
                            <Link
                                href="https://thirdygayares.com"
                                className="rounded-md border border-border/70 p-2 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                                aria-label="Website"
                            >
                                <Globe className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 text-base font-semibold text-foreground sm:text-lg">Navigation</h3>
                        <ul className="space-y-2.5">
                            {quickLinks.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-primary sm:text-base">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href="/#tools" className="text-sm text-muted-foreground transition-colors hover:text-primary sm:text-base">
                                    Tools
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-base font-semibold text-foreground sm:text-lg">Tools</h3>
                        <ul className="space-y-2.5">
                            {tools.map((tool) => (
                                <li key={tool.id}>
                                    {tool.available ? (
                                        <Link
                                            href={tool.href!}
                                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary sm:text-base"
                                        >
                                            <span>{tool.name}</span>
                                        </Link>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground/80 sm:text-base">
                                            <span>{tool.name}</span>
                                            <span className="rounded border border-warning/35 bg-warning/15 px-2 py-0.5 text-xs text-warning">
                                                Soon
                                            </span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-3 text-base font-semibold text-foreground sm:text-lg">{footerData.about.title}</h3>
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{footerData.about.description}</p>
                        <ul className="space-y-2.5">
                            {footerData.about.links.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary sm:text-base">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <h3 className="mb-3 mt-6 text-base font-semibold text-foreground sm:text-lg">Legal</h3>
                        <ul className="space-y-2.5">
                            {footerData.legal.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary sm:text-base">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t border-border/70 pt-6 sm:mt-12 sm:pt-7">
                    <div className="flex flex-col items-start justify-between gap-2 text-left sm:flex-row sm:items-center sm:text-left">
                        <p className="text-sm text-muted-foreground sm:text-base">
                            © {new Date().getFullYear()} PDF Toolkit. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
