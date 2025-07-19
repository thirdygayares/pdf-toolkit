"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { FileText, Upload, Download, Copy, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import {useExtractText} from "@/hooks/useExtractText";
import {ExtractTextFAQ} from "@/components/faqs/FaqExtractText";


export function ExtractText() {
    const { extractedData, isExtracting, error, extractText, clearData } = useExtractText()
    const [copySuccess, setCopySuccess] = useState(false)

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0]
            if (file) {
                extractText(file)
            }
        },
        [extractText],
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        multiple: false,
        disabled: isExtracting,
    })

    const handleCopyText = async () => {
        if (extractedData?.text) {
            try {
                await navigator.clipboard.writeText(extractedData.text)
                setCopySuccess(true)
                setTimeout(() => setCopySuccess(false), 2000)
            } catch (err) {
                console.error("Failed to copy text:", err)
            }
        }
    }

    const handleDownloadText = () => {
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
    }

    const handleReset = () => {
        clearData()
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <FileText className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">PDF Text Extractor</h1>
                        </div>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Extract readable text from PDF files instantly. No uploads, completely private processing in your browser.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {/* Left Column - Features */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-6">Extract text from PDFs in seconds</h2>
                            <p className="text-muted-foreground mb-6">
                                Convert PDF content into plain, selectable text for easy copying, analysis, or conversion.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Extract text from any text-based PDF</p>
                                        <p className="text-sm text-muted-foreground">Perfect for reports, contracts, and documents</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Copy or download extracted text</p>
                                        <p className="text-sm text-muted-foreground">Get your text in the format you need</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">100% private and secure</p>
                                        <p className="text-sm text-muted-foreground">All processing happens in your browser</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Upload Area */}
                    <div className="space-y-6">
                        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                            <CardContent className="p-8">
                                {!extractedData ? (
                                    <div
                                        {...getRootProps()}
                                        className={`text-center cursor-pointer transition-colors ${
                                            isDragActive ? "text-primary" : "text-muted-foreground"
                                        } ${isExtracting ? "pointer-events-none opacity-50" : ""}`}
                                    >
                                        <input {...getInputProps()} />
                                        <div className="flex flex-col items-center gap-4">
                                            {isExtracting ? (
                                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                            ) : (
                                                <Upload className="h-12 w-12" />
                                            )}
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                                    {isExtracting ? "Extracting text..." : "Upload your PDF file"}
                                                </h3>
                                                <p className="text-sm">
                                                    {isDragActive ? "Drop your PDF file here" : "Drop PDF file here or click to browse"}
                                                </p>
                                            </div>
                                            {!isExtracting && (
                                                <Button variant="secondary" size="sm">
                                                    Select File
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                            <h3 className="text-lg font-semibold text-foreground">Text Extracted Successfully!</h3>
                                        </div>
                                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                                            <span>{extractedData.fileName}</span>
                                            <span>•</span>
                                            <span>{extractedData.charCount.toLocaleString()} characters</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 justify-center">
                                            <Button onClick={handleCopyText} variant="outline" size="sm">
                                                {copySuccess ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy Text
                                                    </>
                                                )}
                                            </Button>
                                            <Button onClick={handleDownloadText} variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                            <Button onClick={handleReset} variant="outline" size="sm">
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                New File
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                        <div className="flex items-center gap-2 text-destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm font-medium">{error}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <p className="text-xs text-muted-foreground text-center">Upload unlimited PDF files, max 100MB each</p>
                    </div>
                </div>

                {/* Extracted Text Display */}
                {extractedData && (
                    <div className="mt-12 max-w-7xl mx-auto">
                        <Separator className="mb-8" />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-foreground">Extracted Text</h3>
                                <div className="flex gap-2">
                                    <Button onClick={handleCopyText} variant="outline" size="sm">
                                        {copySuccess ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy All
                                            </>
                                        )}
                                    </Button>
                                    <Button onClick={handleDownloadText} variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                            <Card>
                                <CardContent className="p-6">
                                    <Textarea
                                        value={extractedData.text}
                                        readOnly
                                        className="min-h-[400px] font-mono text-sm resize-none"
                                        placeholder="Extracted text will appear here..."
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* FAQ Section */}
                <div className="mt-16">
                    <Separator className="mb-12" />
                    <ExtractTextFAQ />
                </div>
            </div>
        </div>
    )
}
