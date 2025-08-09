"use client"

import {useRouter, useSearchParams} from "next/navigation"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Download, Home, Undo2 } from "lucide-react"
import {NoResult} from "@/app/split-pdf/success/components/NoResult";
import {useSplitPdfDownload} from "@/app/split-pdf/success/hooks/useSplitPdfDownload";
import {DialogDownloadSplitPdf} from "@/app/split-pdf/success/components/DialogDownloadSplitPdf";


export default function SplitSuccessPage(){
    const router = useRouter()
    const params = useSearchParams()

    const {confirmDownload, open, setOpen,setFilename, result, filename, defaultName} = useSplitPdfDownload(params);

    if (!result) {
        return <NoResult/>
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-16 max-w-2xl">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                            <CardTitle>Split Successful</CardTitle>
                        </div>
                        <div className="text-sm text-muted-foreground">Your PDF is ready to download.</div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-6">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                Source: {result.originalName}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <DialogDownloadSplitPdf open={open} setOpen={setOpen} confirmDownload={confirmDownload} setFilename={setFilename} defaultName={defaultName} filename={filename}/>

                            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/split-pdf")}>
                                <Undo2 className="h-4 w-4 mr-2" />
                                Split another PDF
                            </Button>
                            <Button variant="ghost" className="flex-1" onClick={() => router.push("/")}>
                                <Home className="h-4 w-4 mr-2" />
                                Back to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </div>
    )
}
