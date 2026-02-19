"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQ } from "@/components/FAQ";
import { MarkdownPdfHeader } from "@/app/markdown-pdf/components/Header";
import { Features } from "@/app/markdown-pdf/components/Features";
import { EditorPane, SAMPLE_MARKDOWN } from "@/app/markdown-pdf/components/EditorPane";
import { PreviewPane, type Theme } from "@/app/markdown-pdf/components/PreviewPane";
import { ConfigPanel } from "@/app/markdown-pdf/components/ConfigPanel";
import { MarkdownPdfFAQS } from "@/components/faqs/FaqMarkdownPdf";

const MarkdownPdfPage: React.FC = () => {
    const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
    const [selectedTheme, setSelectedTheme] = useState<Theme>("documentation");

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <MarkdownPdfHeader />

            <div className="container mx-auto px-4 py-8">
                {/* Features + Editor/Preview split */}
                <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-10">
                    <Features />

                    {/* Editor + Preview stacked on the right column */}
                    <div className="space-y-4">
                        <EditorPane value={markdown} onChange={setMarkdown} />
                        <PreviewPane markdown={markdown} theme={selectedTheme} />
                    </div>
                </div>

                {/* Full-width Config Panel */}
                <div className="max-w-7xl mx-auto">
                    <ConfigPanel
                        selectedTheme={selectedTheme}
                        onThemeChange={setSelectedTheme}
                    />
                </div>

                {/* FAQ */}
                <div className="mt-16">
                    <FAQ
                        items={MarkdownPdfFAQS}
                        title="❓ FAQ"
                        description="Common questions about the Markdown to PDF converter"
                        richResults
                        accordionType="multiple"
                        collapsible
                    />
                </div>
            </div>

            <Separator />
            <Footer />
        </div>
    );
};

export default MarkdownPdfPage;
