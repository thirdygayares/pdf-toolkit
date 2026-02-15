"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, Sparkles } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { navigation } from "@/data/navigation"
import { tools } from "@/data/tools"

const isHrefActive = (pathname: string, href: string) => {
    if (href === "/") {
        return pathname === "/"
    }
    if (href.startsWith("/#")) {
        return pathname === "/"
    }
    return pathname === href
}

export const MainNavigationMenu = () => {
    const pathname = usePathname()
    const [isToolsOpen, setIsToolsOpen] = useState(false)
    const toolsMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isToolsOpen) {
            return
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (!toolsMenuRef.current?.contains(event.target as Node)) {
                setIsToolsOpen(false)
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsToolsOpen(false)
            }
        }

        document.addEventListener("mousedown", handlePointerDown)
        document.addEventListener("keydown", handleEscape)
        return () => {
            document.removeEventListener("mousedown", handlePointerDown)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [isToolsOpen])

    return (
        <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
                if (!item.children) {
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors",
                                "hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/70",
                                isHrefActive(pathname, item.href) ? "bg-accent text-foreground" : "text-muted-foreground",
                            )}
                        >
                            {item.name}
                        </Link>
                    )
                }

                return (
                    <div key={item.name} ref={toolsMenuRef} className="relative">
                        <button
                            type="button"
                            className={cn(
                                "inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors",
                                "hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/70",
                                isToolsOpen || isHrefActive(pathname, item.href) ? "bg-accent text-foreground" : "text-muted-foreground",
                            )}
                            aria-haspopup="menu"
                            aria-expanded={isToolsOpen}
                            onClick={() => setIsToolsOpen((prev) => !prev)}
                        >
                            {item.name}
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isToolsOpen && "rotate-180")} />
                        </button>

                        {isToolsOpen && (
                            <div className="absolute left-1/2 top-full z-50 mt-3 w-[36rem] max-w-[78vw] -translate-x-1/2 rounded-2xl border border-border/80 bg-card p-4 shadow-xl">
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <p className="text-sm font-semibold text-foreground">Open a PDF tool directly</p>
                                    <Button asChild variant="outline" size="sm" className="h-8 rounded-md text-xs">
                                        <Link href="/#tools" onClick={() => setIsToolsOpen(false)}>
                                            View all
                                        </Link>
                                    </Button>
                                </div>

                                <div className="grid gap-2 sm:grid-cols-2">
                                    {tools.map((tool) =>
                                        tool.available ? (
                                            <Link
                                                key={tool.id}
                                                href={tool.href!}
                                                onClick={() => setIsToolsOpen(false)}
                                                className="rounded-lg border border-border/80 bg-surface/60 px-3 py-2.5 text-sm transition-colors hover:border-primary/30 hover:bg-accent"
                                            >
                                                <p className="font-medium text-foreground">{tool.name}</p>
                                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{tool.description}</p>
                                            </Link>
                                        ) : (
                                            <div
                                                key={tool.id}
                                                className="rounded-lg border border-dashed border-border bg-surface/40 px-3 py-2.5 text-sm opacity-80"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="font-medium text-muted-foreground">{tool.name}</p>
                                                    <span className="rounded border border-warning/35 bg-warning/15 px-2 py-0.5 text-[11px] text-warning">
                                                        Soon
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{tool.description}</p>
                                            </div>
                                        ),
                                    )}
                                </div>

                                <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                                    <Sparkles className="h-3 w-3 text-primary" />
                                    Fast, private PDF workflow
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
