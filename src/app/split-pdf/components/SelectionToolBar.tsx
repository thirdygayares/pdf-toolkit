import { Button } from "@/components/ui/button"
import { Check, RefreshCw } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Props {
    setAll: (value: boolean) => void
    invert: () => void
    columns: 1 | 2 | 3 | 4 | 5
    setColumns: (value: 1 | 2 | 3 | 4 | 5) => void
}

const columnOptions: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5]

export const SelectionToolBar = ({ setAll, invert, columns, setColumns }: Props) => {
    return (
        <div className="mb-5 space-y-4 rounded-xl border border-border/70 bg-surface/45 p-3.5 sm:p-4">
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-9 rounded-md" onClick={() => setAll(true)}>
                    <Check className="mr-1.5 h-4 w-4" />
                    Select all
                </Button>
                <Button variant="outline" size="sm" className="h-9 rounded-md" onClick={() => setAll(false)}>
                    <RefreshCw className="mr-1.5 h-4 w-4 rotate-180" />
                    Unselect all
                </Button>
                <Button variant="outline" size="sm" className="h-9 rounded-md" onClick={invert}>
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                    Invert
                </Button>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-sm text-muted-foreground">Pages per row</span>
                <div className="flex flex-wrap gap-1.5">
                    {columnOptions.map((value) => (
                        <Button
                            key={value}
                            variant={columns === value ? "default" : "outline"}
                            size="sm"
                            className={cn("h-9 min-w-9 rounded-md px-3", value > 2 && "hidden md:inline-flex")}
                            onClick={() => setColumns(value)}
                        >
                            {value}
                        </Button>
                    ))}
                </div>
            </div>

            <p className="text-xs text-muted-foreground">Tip: drag page cards using the handle to set output order before splitting.</p>
        </div>
    )
}
