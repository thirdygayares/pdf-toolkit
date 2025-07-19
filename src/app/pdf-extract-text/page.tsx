"use client";

import { useState } from "react";
import { useExtractText } from "@/hooks/useExtractText";

import { ExtractTextFAQ } from "@/components/faqs/FaqExtractText";
import {ExtractTextHeader} from "@/app/pdf-extract-text/components/Header";
import {Features} from "@/app/pdf-extract-text/components/Features";
import {UploadArea} from "@/app/pdf-extract-text/components/UploadArea";
import {ErrorAlert} from "@/app/pdf-extract-text/components/ErrorAlert";
import {ExtractedTextSection} from "@/app/pdf-extract-text/components/ExtractedTextSection";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";

const ExtractTextPage: React.FC = () => {
    const { extractedData, isExtracting, error, extractText, clearData } =
        useExtractText();
    const [copySuccess, setCopySuccess] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <ExtractTextHeader />

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    <Features />

                    <UploadArea
                        extractedData={extractedData}
                        isExtracting={isExtracting}
                        onDrop={extractText}
                        clearData={clearData}
                        copySuccess={copySuccess}
                        setCopySuccess={setCopySuccess}
                    />
                </div>

                {error && <ErrorAlert message={error} />}

                {extractedData && (
                    <ExtractedTextSection
                        extractedData={extractedData}
                        copySuccess={copySuccess}
                        setCopySuccess={setCopySuccess}
                        clearData={clearData}
                    />
                )}

                <div className="mt-16">
                    <ExtractTextFAQ />
                </div>
            </div>
            <Footer />
        </div>
    );
};


export default ExtractTextPage;