"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ListOrdered, Settings2 } from "lucide-react"

import { PageNumberOptions, PositionX, PositionY, FormatStyle } from "../hooks/usePageNumberPdf"

interface PageNumberActionProps {
    applyPageNumbers: () => void
    busy: boolean
    options: PageNumberOptions
    setOptions: React.Dispatch<React.SetStateAction<PageNumberOptions>>
    hasFile: boolean
}

export const PageNumberAction = ({ applyPageNumbers, busy, options, setOptions, hasFile }: PageNumberActionProps) => {
    if (!hasFile) return null

    return (
        <Card className="rounded-2xl border-border/80 shadow-sm mt-8">
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Settings2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Page Number Options</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-3">
                        <Label>Horizontal Position</Label>
                        <select
                            value={options.positionX}
                            onChange={(e) => setOptions(prev => ({ ...prev, positionX: e.target.value as PositionX }))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                            <option value="left">Left align</option>
                            <option value="center">Center align</option>
                            <option value="right">Right align</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <Label>Vertical Position</Label>
                        <select
                            value={options.positionY}
                            onChange={(e) => setOptions(prev => ({ ...prev, positionY: e.target.value as PositionY }))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <Label>Number Format</Label>
                        <select
                            value={options.formatStyle}
                            onChange={(e) => setOptions(prev => ({ ...prev, formatStyle: e.target.value as FormatStyle }))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                            <option value="n">1, 2, 3...</option>
                            <option value="n_of_total">1 of 3, 2 of 3...</option>
                            <option value="dash_n_dash">- 1 -, - 2 -...</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label htmlFor="fontSize">Font Size ({options.fontSize}px)</Label>
                        </div>
                        <input
                            id="fontSize"
                            type="range"
                            min="8"
                            max="72"
                            step="1"
                            value={options.fontSize}
                            onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                            className="w-full h-8 accent-primary mt-1"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/50">
                    <Button
                        size="lg"
                        onClick={applyPageNumbers}
                        disabled={busy}
                        className="w-full sm:w-auto font-semibold gap-2"
                    >
                        {busy ? (
                            <>
                                <span className="animate-spin duration-500">⏳</span>
                                Adding Numbers...
                            </>
                        ) : (
                            <>
                                <ListOrdered className="h-4 w-4" />
                                Add Page Numbers
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
