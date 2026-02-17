import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, RefreshCw } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Props {
    setAll: (value: boolean) => void
    invert: () => void
    columns?: 1 | 2 | 3 | 4 | 5
    setColumns?: (value: 1 | 2 | 3 | 4 | 5) => void
    showColumnControls?: boolean
    customRange?: string
    onCustomRangeChange?: (value: string) => void
    onApplyCustomRange?: () => void
    customRangeError?: string | null
    customRangePlaceholder?: string
    tipText?: string
}

const columnOptions: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5]

export const SelectionToolBar = ({
    setAll,
    invert,
    columns,
    setColumns,
    showColumnControls = true,
    customRange,
    onCustomRangeChange,
    onApplyCustomRange,
    customRangeError,
    customRangePlaceholder = "1-10 or 1, 3, 7",
    tipText = "Tip: drag page cards using the handle to set output order before splitting.",
}: Props) => {
    const hasCustomRange = typeof onCustomRangeChange === "function" && typeof onApplyCustomRange === "function"
    const hasColumnControls = showColumnControls && typeof columns === "number" && typeof setColumns === "function"

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

            {hasCustomRange && (
                <div className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <Input
                            value={customRange ?? ""}
                            onChange={(event) => onCustomRangeChange?.(event.target.value)}
                            placeholder={customRangePlaceholder}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault()
                                    onApplyCustomRange?.()
                                }
                            }}
                        />
                        <Button variant="outline" size="sm" className="h-9 rounded-md" onClick={() => onApplyCustomRange?.()}>
                            Apply range
                        </Button>
                    </div>
                    {customRangeError && <p className="text-xs text-destructive">{customRangeError}</p>}
                </div>
            )}

            <Separator />

            {hasColumnControls && (
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
            )}

            {tipText && <p className="text-xs text-muted-foreground">{tipText}</p>}
        </div>
    )
}
