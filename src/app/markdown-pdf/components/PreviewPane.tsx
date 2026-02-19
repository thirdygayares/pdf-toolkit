"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Maximize2 } from "lucide-react";

export type Theme = "documentation" | "manuscript" | "terminal";
export type PageFormat = "A4" | "Letter" | "Legal";

// Page dimensions in pixels at 96 DPI (screen)
// A4: 210×297mm → ~794×1123px
// Letter: 8.5×11in → 816×1056px
// Legal: 8.5×14in → 816×1344px
export const PAGE_DIMENSIONS: Record<PageFormat, { width: number; height: number }> = {
    A4: { width: 794, height: 1123 },
    Letter: { width: 816, height: 1056 },
    Legal: { width: 816, height: 1344 },
};

interface PreviewPaneProps {
    markdown: string;
    theme: Theme;
    pageFormat: PageFormat;
    /** ref forwarded so parent can capture for PDF export */
    pagesRef?: React.RefObject<HTMLDivElement | null>;
    /** called when user clicks the fullscreen/expand icon */
    onOpenPreview?: () => void;
}

function getThemeStyles(theme: Theme): {
    container: React.CSSProperties;
    prose: string;
    bg: string;
} {
    switch (theme) {
        case "terminal":
            return {
                // Explicit hex — html2canvas cannot parse oklch/lab CSS colors
                container: { backgroundColor: "#0d1117", color: "#c9d1d9" },
                prose: "font-mono prose-invert prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-[#30363d] prose-code:text-[#79c0ff] prose-headings:text-[#c9d1d9] prose-p:text-[#c9d1d9] prose-li:text-[#c9d1d9] prose-strong:text-[#c9d1d9] prose-blockquote:border-[#30363d] prose-blockquote:text-[#8b949e]",
                bg: "#0d1117",
            };
        case "manuscript":
            return {
                container: { backgroundColor: "#ffffff", color: "#111827" },
                prose: "font-serif prose-headings:font-serif prose-p:leading-8",
                bg: "#ffffff",
            };
        default: // documentation
            return {
                container: { backgroundColor: "#ffffff", color: "#111827" },
                prose: "font-sans",
                bg: "#ffffff",
            };
    }
}

/** Split markdown on pagebreak markers */
export function splitIntoPages(markdown: string): string[] {
    return markdown
        .split(/<!--\s*pagebreak\s*-->|\n\\newpage\n/i)
        .map((s) => s.trim())
        .filter(Boolean);
}

interface PageSheetProps {
    content: string;
    theme: Theme;
    pageFormat: PageFormat;
    pageNumber: number;
    totalPages: number;
    justify?: boolean;
}

export function PageSheet({
    content,
    theme,
    pageFormat,
    pageNumber,
    totalPages,
    justify,
}: PageSheetProps) {
    const dims = PAGE_DIMENSIONS[pageFormat];
    const { container, prose } = getThemeStyles(theme);
    const isTerminal = theme === "terminal";

    return (
        <div
            className="relative shadow-lg flex-shrink-0 overflow-hidden"
            style={{ width: dims.width, minHeight: dims.height, ...container }}
            data-page={pageNumber}
        >
            {/* Page content */}
            <div className={cn("p-12", justify && "text-justify")}>
                <div
                    className={cn(
                        "prose prose-sm max-w-none",
                        prose,
                        isTerminal && "prose-invert"
                    )}
                >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Page number footer */}
            <div
                className="absolute bottom-4 left-0 right-0 text-center text-[10px]"
                style={{ color: isTerminal ? "#8b949e" : "#9ca3af" }}
            >
                {pageNumber} / {totalPages}
            </div>
        </div>
    );
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
    markdown,
    theme,
    pageFormat,
    pagesRef,
    onOpenPreview,
}) => {
    const isTerminal = theme === "terminal";
    const pages = splitIntoPages(markdown || " ");

    return (
        <div
            className="flex flex-col h-full overflow-hidden"
            style={{
                borderLeft: `1px solid ${isTerminal ? "#30363d" : "hsl(var(--border, 214.3 31.8% 91.4%))"}`,
                backgroundColor: isTerminal ? "#0d1117" : undefined,
            }}
        >
            {/* Toolbar */}
            <div
                className={cn(
                    "flex items-center justify-between px-3 py-2 border-b flex-shrink-0",
                    isTerminal
                        ? "border-[#30363d] bg-[#161b22]"
                        : "bg-muted/40 border-border"
                )}
            >
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span
                    className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        isTerminal ? "text-[#8b949e]" : "text-muted-foreground"
                    )}
                >
                    PDF Preview
                </span>
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded",
                            isTerminal
                                ? "bg-[#21262d] text-[#8b949e]"
                                : "bg-muted text-muted-foreground"
                        )}
                    >
                        {pages.length} {pages.length === 1 ? "Page" : "Pages"}
                    </span>
                    {onOpenPreview && (
                        <button
                            type="button"
                            onClick={onOpenPreview}
                            title="Open full preview"
                            className={cn(
                                "h-6 w-6 flex items-center justify-center rounded hover:bg-muted/60 transition-colors",
                                isTerminal ? "text-[#8b949e] hover:bg-[#21262d]" : "text-muted-foreground"
                            )}
                        >
                            <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable preview area */}
            <div
                className={cn(
                    "flex-1 overflow-auto p-4",
                    isTerminal ? "bg-[#0a0d11]" : "bg-muted/30"
                )}
            >
                {/* Pages container — captured for export */}
                <div
                    ref={pagesRef}
                    className="flex flex-col items-center gap-6"
                >
                    {pages.map((pageContent, idx) => (
                        <PageSheet
                            key={idx}
                            content={pageContent}
                            theme={theme}
                            pageFormat={pageFormat}
                            pageNumber={idx + 1}
                            totalPages={pages.length}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
