import {Header} from "@/components/Header";
import {Suspense} from "react";
import {Footer} from "@/components/Footer";
import {Loader2} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {SplitSuccessContent} from "@/app/split-pdf/success/SplitSucessContent";


const LoadingCard= () => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <CardTitle>Split Pdf Initiating</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                Waiting for URL parameters.
            </CardContent>
        </Card>
    )
}


export default function SplitSuccessPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-16 max-w-2xl">
                <Suspense fallback={<LoadingCard />}>
                    <SplitSuccessContent />
                </Suspense>
            </div>
            <Footer />
        </div>
    )
}