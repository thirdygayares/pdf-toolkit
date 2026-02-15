import { CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LayoutGrid } from "lucide-react"
import { SplitState } from "@/app/split-pdf/hooks/useSplitPdf"

interface Props {
    state: SplitState
    includedCount: number
    columns: 1 | 2 | 3 | 4 | 5
}

export const PageSelectionHeader = ({ state, includedCount, columns }: Props) => {
    return (
        <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Select pages to keep</CardTitle>
                <Badge variant="secondary" className="rounded-full border-primary/25 bg-primary/10 px-2.5 py-1 text-primary">
                    <LayoutGrid className="mr-1 h-3.5 w-3.5" />
                    {columns} / row
                </Badge>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground sm:text-base">
                Files: {state.sourceNames.length} • Pages: {state.pageCount} • Selected: {includedCount}
            </p>
        </div>
    )
}
