import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {SplitState} from "@/app/split-pdf/hooks/useSplitPdf";


interface Props {
    state: SplitState;
    splitPdf: () => void;
    clearAll: () => void;
}

export const SplitPdfAction = (props: Props) => {
    const { state, splitPdf, clearAll } = props;
    return(
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button className="w-full sm:w-auto" onClick={splitPdf} disabled={state.busy}>
                {state.busy ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Splitting…
                    </>
                ) : (
                    "Split PDF"
                )}
            </Button>
            <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
                onClick={clearAll}
                disabled={state.busy}
            >
                Start over
            </Button>
        </div>
    )
}