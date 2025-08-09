"use client"

import {  useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Check, LayoutGrid, Loader2, RefreshCw } from "lucide-react"
import {SplitHero} from "@/app/split-pdf/components/SplitHero";
import {UploadSingle} from "@/app/split-pdf/components/UploadHero";
import {SplitGrid} from "@/app/split-pdf/components/SplitGrid";
import {useSplitPdf} from "@/app/split-pdf/hooks/useSplitPdf";
import {SelectionToolBar} from "@/app/split-pdf/components/SelectionToolBar";
import {PageSelectionHeader} from "@/app/split-pdf/components/PageSelectionHeader";
import {SplitPdfAction} from "@/app/split-pdf/components/SplitPdfAction";


export default function SplitPdfPage() {
    const router = useRouter()
    const { state, loadPdf, clearAll, toggle, setAll, invert, splitPdf, includedCount } = useSplitPdf()
    const [columns, setColumns] = useState<1 | 2 | 3 | 4 | 5 >(2)

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
                    <SplitHero />
                    <UploadSingle onFileReady={(f) => loadPdf(f)} hasFile={!!state.file} onReset={clearAll} />
                </div>
            </div>

            {state.error && (
                <div className="container mx-auto px-4">
                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">{state.error}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Split selector appears once a file is loaded */}
            {state.pageCount > 0 && state.file && (
                <section className="container mx-auto px-4 py-10 max-w-6xl">
                    <Card>
                        <CardHeader className="pb-2">
                            <PageSelectionHeader state={state} includedCount={includedCount} columns={columns}/>
                        </CardHeader>
                        <CardContent>
                            <SelectionToolBar setAll={setAll} invert={invert} columns={columns} setColumns={setColumns}/>
                            <SplitGrid
                                file={state.file}
                                pageCount={state.pageCount}
                                checked={state.checked}
                                onToggle={toggle}
                                columns={columns}
                            />
                            <SplitPdfAction splitPdf={splitPdf} state={state} clearAll={clearAll} />

                        </CardContent>
                    </Card>
                </section>
            )}

            <div className="mt-12">
                <Separator className="mb-12" />
            </div>
            <Footer />
        </div>
    )
}
