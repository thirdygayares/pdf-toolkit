import {Header} from "@/components/Header";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Home, Scissors} from "lucide-react";
import {Footer} from "@/components/Footer";
import {useRouter} from "next/navigation";


export const NoResult = () => {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-16 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>No split file found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            It looks like there’s no split result available. Please run the Split PDF tool again.
                        </p>
                        <div className="flex gap-3">
                            <Button onClick={() => router.push("/split-pdf")} className="flex-1">
                                <Scissors className="h-4 w-4 mr-2" />
                                Go to Split PDF
                            </Button>
                            <Button variant="outline" onClick={() => router.push("/")} className="flex-1">
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