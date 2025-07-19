"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { navigation } from "@/data/navigation"
import { tools } from "@/data/tools"

export const MainNavigationMenu = () => {
    const pathname = usePathname()

    return (
        <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
                {navigation.map((item) => (
                    <NavigationMenuItem key={item.name}>
                        {item.children ? (
                            <>
                                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">{item.name}</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="grid w-[400px] gap-3 p-4">
                                        <div className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/20 to-primary/10 p-6 no-underline outline-none focus:shadow-md">
                                                    <div className="mb-2 mt-4 text-lg font-medium">PDF Tools</div>
                                                    <p className="text-sm leading-tight text-muted-foreground">
                                                        Professional PDF tools for all your document needs
                                                    </p>
                                                </div>
                                            </NavigationMenuLink>
                                        </div>
                                        <div className="grid gap-1">
                                            {tools.map((tool) => (
                                                <NavigationMenuLink key={tool.id} asChild>
                                                    <Link
                                                        href={tool.available ? tool.href! : "#"}
                                                        className={cn(
                                                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                                            !tool.available && "opacity-50 cursor-not-allowed",
                                                        )}
                                                    >
                                                        <div className="text-sm font-medium leading-none flex items-center justify-between">
                                                            {tool.name}
                                                            {!tool.available && <span className="text-xs text-muted-foreground">(Soon)</span>}
                                                        </div>
                                                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                                            {tool.description}
                                                        </p>
                                                    </Link>
                                                </NavigationMenuLink>
                                            ))}
                                        </div>
                                    </div>
                                </NavigationMenuContent>
                            </>
                        ) : (
                            <NavigationMenuLink asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                                        pathname === item.href && "bg-accent text-accent-foreground",
                                    )}
                                >
                                    {item.name}
                                </Link>
                            </NavigationMenuLink>
                        )}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    )
}
