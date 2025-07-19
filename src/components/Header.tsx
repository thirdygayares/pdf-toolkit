"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MainNavigationMenu } from "@/components/NavigationMenu"
import { navigation } from "@/data/navigation"
import { tools } from "@/data/tools"

export const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const pathname = usePathname()


    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="relative">
                            <Image src="/logo.svg" alt="PDF Toolkit" width={36} height={36} className="h-9 w-9" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-primary">PDF Toolkit</span>
                            <span className="text-xs text-muted-foreground -mt-1">Professional Tools</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <MainNavigationMenu />


                    {/* Mobile Menu Button */}
                    <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t py-4 bg-background/95 backdrop-blur-md">
                        <nav className="flex flex-col space-y-4">
                            {navigation.map((item) => (
                                <div key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                    {item.children && (
                                        <div className="ml-4 mt-2 space-y-2 border-l border-border pl-4">
                                            {tools.map((tool) => (
                                                <Link
                                                    key={tool.id}
                                                    href={tool.available ? tool.href! : "#"}
                                                    className={`block text-sm text-muted-foreground hover:text-primary transition-colors py-1 ${
                                                        !tool.available ? "opacity-50" : ""
                                                    }`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {tool.name}
                                                    {!tool.available && <span className="text-xs ml-1">(Soon)</span>}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
