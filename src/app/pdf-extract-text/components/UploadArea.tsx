// app/pdf-extract-text/components/UploadArea.tsx
"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Upload,
    Loader2,
    CheckCircle,
    Copy,
    Download,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

interface UploadAreaProps {
    extractedData: {
        fileName: string;
        charCount: number;
        text: string;
    } | null;
    isExtracting: boolean;
    onDrop: (file: File) => void;
    clearData: () => void;
    copySuccess: boolean;
    setCopySuccess: (v: boolean) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
                                                          extractedData,
                                                          isExtracting,
                                                          onDrop,
                                                          clearData,
                                                          copySuccess,
                                                          setCopySuccess,
                                                      }) => {
    // wrap the onDrop prop so dropzone gives us the first file
    const handleDrop = useCallback(
        (files: File[]) => {
            if (files[0]) onDrop(files[0]);
        },
        [onDrop]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDrop,
        accept: { "application/pdf": [".pdf"] },
        multiple: false,
        disabled: isExtracting,
    });

    const handleCopyText = async () => {
        if (!extractedData) return;
        try {
            await navigator.clipboard.writeText(extractedData.text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    const handleDownloadText = () => {
        if (!extractedData) return;
        const blob = new Blob([extractedData.text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = extractedData.fileName.replace(".pdf", "_extracted.txt");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleNewFile = () => clearData();

    return (
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-8">
                {!extractedData ? (
                    <div
                        {...getRootProps()}
                        className={`
              text-center cursor-pointer transition-colors flex flex-col items-center justify-center
              ${isDragActive ? "text-primary" : "text-muted-foreground"}
              ${isExtracting ? "pointer-events-none opacity-50" : ""}
            `}
                    >
                        <input {...getInputProps()} />
                        {isExtracting ? (
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        ) : (
                            <Upload className="h-12 w-12" />
                        )}
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {isExtracting ? "Extracting text…" : "Upload your PDF file"}
                        </h3>
                        <p className="text-sm mb-4">
                            {isDragActive
                                ? "Drop PDF here"
                                : "Drop PDF file here or click to browse"}
                        </p>
                        {!isExtracting && (
                            <Button variant="secondary" size="sm">
                                Select File
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            <h3 className="text-lg font-semibold text-foreground">
                                Extraction Complete
                            </h3>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <span>{extractedData.fileName}</span>
                            <span>•</span>
                            <span>{extractedData.charCount.toLocaleString()} characters</span>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Button onClick={handleCopyText} variant="outline" size="sm">
                                {copySuccess ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copy Text
                                    </>
                                )}
                            </Button>
                            <Button onClick={handleDownloadText} variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                            </Button>
                            <Button onClick={handleNewFile} variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                New File
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
