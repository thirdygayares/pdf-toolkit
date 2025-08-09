import {Button} from "@/components/ui/button";
import {Check, RefreshCw} from "lucide-react";
import {Separator} from "@/components/ui/separator";

interface Props {
    setAll: (value: boolean) => void;
    invert: () => void;
    columns: 1 | 2 | 3 | 4 | 5;
    setColumns: (value: 1 | 2 | 3 | 4 | 5) => void;
}

export const SelectionToolBar = (props: Props) => {
    const { setAll, invert, columns, setColumns } = props;
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={() => setAll(true)}>
                <Check className="h-4 w-4 mr-2" />
                Select all
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAll(false)}>
                <RefreshCw className="h-4 w-4 mr-2 rotate-180" />
                Unselect all
            </Button>
            <Button variant="outline" size="sm" onClick={invert}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Invert selection
            </Button>


            <Separator className="mx-2 my-2 w-px h-6" />

            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Pages per row:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                    <Button
                        key={n}
                        variant={columns === (n as any) ? "default" : "outline"}
                        size="sm"
                        onClick={() => setColumns(n as 1 | 2 | 3 | 4 | 5)}
                    >
                        {n}
                    </Button>
                ))}
            </div>
        </div>
    )
}