"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQ } from "@/components/FAQ";
import { EditorPane, SAMPLE_MARKDOWN } from "@/app/markdown-pdf/components/EditorPane";
import { PreviewPane, type Theme } from "@/app/markdown-pdf/components/PreviewPane";
import { Features } from "@/app/markdown-pdf/components/Features";
import { ConfigPanel } from "@/app/markdown-pdf/components/ConfigPanel";
import { MarkdownPdfFAQS } from "@/components/faqs/FaqMarkdownPdf";

const MarkdownPdfPage: React.FC = () => {
    const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
    const [selectedTheme, setSelectedTheme] = useState<Theme>("documentation");

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-6 sm:py-10">
                <section className="mx-auto max-w-5xl space-y-7 sm:space-y-10">
                    {/* Hero / Features block — same pattern as SplitHero & merge Hero */}
                    <Features />

                    {/* Editor + Preview side-by-side on desktop, stacked on mobile */}
                    <Card className="rounded-2xl border-border/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-foreground">
                                Split-screen editor
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Write Markdown on the left — see a live structural preview on the right.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid lg:grid-cols-2 gap-4">
                                <EditorPane value={markdown} onChange={setMarkdown} />
                                <PreviewPane markdown={markdown} theme={selectedTheme} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Config Panel — theme, page format, features, metadata, export */}
                    <ConfigPanel
                        selectedTheme={selectedTheme}
                        onThemeChange={setSelectedTheme}
                    />
                </section>
            </main>

            <div className="mt-12">
                <Separator className="mb-12" />
                <FAQ
                    items={MarkdownPdfFAQS}
                    title="❓ FAQ"
                    description="Common questions about the Markdown to PDF converter"
                    richResults
                    accordionType="multiple"
                    collapsible
                />
            </div>

            <Footer />
        </div>
    );
};

export default MarkdownPdfPage;
