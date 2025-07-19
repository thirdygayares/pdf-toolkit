// app/pdf-extract-text/components/ExtractedTextSection.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, CheckCircle } from "lucide-react";

interface Props {
    extractedData: { text: string; fileName: string; charCount: number };
    copySuccess: boolean;
    setCopySuccess: (v: boolean) => void;
    clearData: () => void;
}

export const ExtractedTextSection: React.FC<Props> = ({
                                                          extractedData,
                                                          copySuccess,
                                                          setCopySuccess,
                                                          clearData,
                                                      }) => {
    const handleCopy = async () => {
        await navigator.clipboard.writeText(extractedData.text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleDownload = () => {
        if (extractedData?.text) {
            const blob = new Blob([extractedData.text], { type: "text/plain" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${extractedData.fileName.replace(".pdf", "")}_extracted_text.txt`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
    };

    return (
        <div className="mt-12 max-w-7xl mx-auto">
            <Separator className="mb-8" />
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Extracted Text</h3>
                <div className="flex gap-2">
                    <Button onClick={handleCopy} variant="outline" size="sm">
                        {copySuccess ? (
                            <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copy All
                            </>
                        )}
                    </Button>
                    <Button onClick={handleDownload} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                    </Button>
                </div>
            </div>
            <Card>
                <CardContent className="p-6">
                    <Textarea
                        readOnly
                        value={extractedData.text}
                        className="min-h-[400px] font-mono text-sm"
                    />
                </CardContent>
            </Card>
        </div>
    );
};
