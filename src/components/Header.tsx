"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MainNavigationMenu } from "@/components/NavigationMenu"
import { navigation } from "@/data/navigation"
import { tools } from "@/data/tools"
import { cn } from "@/lib/utils"

export const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const pathname = usePathname()
    const topLinks = navigation.filter((item) => !item.children)
    const toolsNav = navigation.find((item) => item.children)

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 10)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => {
        if (!mobileMenuOpen) {
            return
        }

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [mobileMenuOpen])

    useEffect(() => {
        if (!mobileMenuOpen) {
            return
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMobileMenuOpen(false)
            }
        }

        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [mobileMenuOpen])

    const closeMenu = () => setMobileMenuOpen(false)

    return (
        <>
            <header
                className={`sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] ${
                    isScrolled
                        ? "border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-xl"
                        : "border-b border-transparent bg-background/70 backdrop-blur-md"
                }`}
            >
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <Link href="/" className="flex items-center space-x-3">
                            <Image src="/logo.svg" alt="PDF Toolkit" width={36} height={36} className="h-9 w-9" />
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-foreground sm:text-xl">PDF Toolkit</span>
                                <span className="text-xs text-muted-foreground -mt-1">Professional tools</span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <MainNavigationMenu key={pathname} />
                            <Button asChild size="sm" className="hidden rounded-lg px-4 text-xs font-semibold md:inline-flex">
                                <Link href="/#tools">
                                    Open Tools
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-lg md:hidden"
                                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={mobileMenuOpen}
                                onClick={() => setMobileMenuOpen((prev) => !prev)}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div
                className={cn(
                    "fixed inset-0 z-[70] md:hidden transition-opacity",
                    mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
                )}
                aria-hidden={!mobileMenuOpen}
            >
                <button
                    type="button"
                    className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
                    onClick={closeMenu}
                    aria-label="Close sidebar"
                />

                <aside
                    className={cn(
                        "absolute right-0 top-0 h-full w-[86vw] max-w-sm border-l border-border/80 bg-background p-5 shadow-xl transition-transform duration-300",
                        mobileMenuOpen ? "translate-x-0" : "translate-x-full",
                    )}
                >
                    <div className="flex items-center justify-between border-b border-border/80 pb-4">
                        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
                            <Image src="/logo.svg" alt="PDF Toolkit" width={36} height={36} className="h-9 w-9" />
                            <div>
                                <p className="text-xl font-semibold text-foreground">PDF Toolkit</p>
                                <p className="text-sm text-muted-foreground">Professional tools</p>
                            </div>
                        </Link>
                        <Button variant="ghost" size="icon" className="rounded-lg" onClick={closeMenu} aria-label="Close menu">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <nav className="mt-5 space-y-5 overflow-y-auto pb-6">
                        <div className="space-y-1">
                            {topLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-accent"
                                    onClick={closeMenu}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {toolsNav && (
                            <div className="rounded-xl border border-border/80 bg-surface/60 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-foreground">{toolsNav.name}</p>
                                    <Link href="/#tools" className="text-xs font-medium text-primary hover:text-primary-hover" onClick={closeMenu}>
                                        All tools
                                    </Link>
                                </div>
                                <ul className="space-y-1.5">
                                    {tools.map((tool) =>
                                        tool.available ? (
                                            <li key={tool.id}>
                                                <Link
                                                    href={tool.href!}
                                                    className="block rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                                                    onClick={closeMenu}
                                                >
                                                    {tool.name}
                                                </Link>
                                            </li>
                                        ) : (
                                            <li key={tool.id} className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-muted-foreground/80">
                                                <span>{tool.name}</span>
                                                <span className="text-xs text-warning">Soon</span>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}

                        <Button asChild className="h-10 w-full rounded-lg font-semibold">
                            <Link href="/#tools" onClick={closeMenu}>
                                Open Tools
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </nav>
                </aside>
            </div>
        </>
    )
}
