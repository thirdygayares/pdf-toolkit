import Link from "next/link"
import Image from "next/image"
import {Github, Twitter, Linkedin, Mail, Globe, Youtube} from "lucide-react"
import { footerData } from "@/data/footer"
import { tools } from "@/data/tools"

export const Footer = () => {
    return (
        <footer className="bg-muted/30 border-t">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Logo and Description */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center space-x-3 mb-6">
                            <Image src="/logo.svg" alt="PDF Toolkit" width={36} height={36} className="h-9 w-9" />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-primary">PDF Toolkit</span>
                                <span className="text-xs text-muted-foreground -mt-1">Professional Tools</span>
                            </div>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                            Professional PDF tools for all your document needs. Fast, secure, and easy to use.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="https://github.com/thirdygayares" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link href="https://www.youtube.com/@thirdygayares" className="text-muted-foreground hover:text-primary transition-colors">
                                <Youtube className="h-5 w-5" />
                            </Link>
                            <Link href="https://www.linkedin.com/in/thirdygayares/" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                            <Link href="https://thirdygayares.com" className="text-muted-foreground hover:text-primary transition-colors">
                                <Globe className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Tools */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-6 text-lg">Tools</h3>
                        <ul className="space-y-3">
                            {tools.map((tool) => (
                                <li key={tool.id}>
                                    <Link
                                        href={tool.available ? tool.href! : "#"}
                                        className={`text-sm transition-colors flex items-center justify-between group ${
                                            tool.available
                                                ? "text-muted-foreground hover:text-primary"
                                                : "text-muted-foreground/50 cursor-not-allowed"
                                        }`}
                                    >
                                        <span>{tool.name}</span>
                                        {!tool.available && (
                                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Soon</span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About Me */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-6 text-lg">{footerData.about.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{footerData.about.description}</p>
                        <ul className="space-y-3">
                            {footerData.about.links.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-6 text-lg">Legal</h3>
                        <ul className="space-y-3">
                            {footerData.legal.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} PDF Toolkit. All rights reserved.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 md:mt-0">Made with ❤️ by Thirdy Gayares</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
