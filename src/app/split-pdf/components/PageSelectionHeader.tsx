import {CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {LayoutGrid} from "lucide-react";
import {SplitState} from "@/app/split-pdf/hooks/useSplitPdf";

interface Props {
    state: SplitState;
    includedCount: number;
    columns: 1 | 2 | 3 | 4 | 5;
}

export const PageSelectionHeader = (props: Props) => {
    const { state, includedCount, columns } = props;

    return (
        <>
            <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Select pages to keep</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    View: {columns} / row
                </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
                File: {state.file?.name} • Pages: {state.pageCount} • Selected: {includedCount}
            </div>
        </>
    )
}