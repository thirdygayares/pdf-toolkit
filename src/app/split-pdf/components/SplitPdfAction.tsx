import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { SplitState } from "@/app/split-pdf/hooks/useSplitPdf"

interface Props {
    state: SplitState
    splitPdf: () => void | Promise<void>
    clearAll: () => void
    includedCount: number
}

export const SplitPdfAction = ({ state, splitPdf, clearAll, includedCount }: Props) => {
    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-6 sm:px-4 sm:pb-4">
            <div className="pointer-events-auto mx-auto max-w-6xl rounded-2xl border border-border/80 bg-background/95 p-3 shadow-lg backdrop-blur-md sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Selected <span className="font-semibold text-foreground">{includedCount}</span> of{" "}
                        <span className="font-semibold text-foreground">{state.pageCount}</span> pages
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2.5">
                        <Button
                            className="h-10 rounded-lg px-5 text-sm font-semibold"
                            onClick={splitPdf}
                            disabled={state.busy || includedCount === 0}
                        >
                            {state.busy ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Splitting...
                                </>
                            ) : (
                                "Split & download"
                            )}
                        </Button>
                        <Button variant="outline" className="h-10 rounded-lg px-4 text-sm" onClick={clearAll} disabled={state.busy}>
                            Start over
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
