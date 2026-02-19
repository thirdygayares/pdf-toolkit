"use client";

import { cn } from "@/lib/utils";

export type Theme = "documentation" | "manuscript" | "terminal";

interface PreviewPaneProps {
    markdown: string;
    theme: Theme;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ markdown, theme }) => {
    const isTerminal = theme === "terminal";

    const lines = markdown.split("\n");

    return (
        <div
            className={cn(
                "flex flex-col border rounded-xl overflow-hidden min-h-80",
                isTerminal ? "bg-[#0d1117] border-[#30363d]" : "bg-card"
            )}
        >
            {/* macOS-style toolbar */}
            <div
                className={cn(
                    "flex items-center justify-between px-3 py-2 border-b",
                    isTerminal ? "border-[#30363d] bg-[#161b22]" : "bg-muted/40 border-border"
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
                <span
                    className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded",
                        isTerminal ? "bg-[#21262d] text-[#8b949e]" : "bg-muted text-muted-foreground"
                    )}
                >
                    Page 1
                </span>
            </div>

            {/* Document page */}
            <div className="flex-1 overflow-y-auto p-4">
                <div
                    className={cn(
                        "border rounded-lg p-5 space-y-3 min-h-64",
                        isTerminal
                            ? "bg-[#0d1117] border-[#30363d]"
                            : "bg-background border-border"
                    )}
                >
                    {lines.map((line, i) => {
                        if (line.startsWith("# ")) {
                            return (
                                <h1
                                    key={i}
                                    className={cn(
                                        "text-xl font-extrabold border-b pb-2",
                                        theme === "manuscript" ? "font-serif" : "font-sans",
                                        isTerminal ? "text-[#c9d1d9] border-[#30363d]" : "text-foreground border-border"
                                    )}
                                >
                                    {line.slice(2)}
                                </h1>
                            );
                        }

                        if (line.startsWith("## ")) {
                            return (
                                <h2
                                    key={i}
                                    className={cn(
                                        "text-base font-bold mt-2",
                                        isTerminal ? "text-[#c9d1d9]" : "text-foreground"
                                    )}
                                >
                                    {line.slice(3)}
                                </h2>
                            );
                        }

                        if (line.startsWith("```")) {
                            const lang = line.replace(/```/g, "").trim();
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "border rounded px-3 py-1.5 text-xs font-mono",
                                        isTerminal
                                            ? "bg-[#161b22] border-[#30363d] text-[#79c0ff]"
                                            : "bg-muted border-border text-primary"
                                    )}
                                >
                                    {lang ? `// ${lang} code block` : "// code block"}
                                </div>
                            );
                        }

                        if (line.startsWith("> ")) {
                            return (
                                <div
                                    key={i}
                                    className="border-l-4 border-primary pl-3"
                                >
                                    <p
                                        className={cn(
                                            "text-xs italic",
                                            isTerminal ? "text-[#8b949e]" : "text-muted-foreground"
                                        )}
                                    >
                                        {line.slice(2)}
                                    </p>
                                </div>
                            );
                        }

                        if (line.startsWith("- [x]")) {
                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-primary flex items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] text-primary-foreground font-black">✓</span>
                                    </div>
                                    <span
                                        className={cn(
                                            "text-xs",
                                            isTerminal ? "text-[#c9d1d9]" : "text-foreground"
                                        )}
                                    >
                                        {line.slice(6)}
                                    </span>
                                </div>
                            );
                        }

                        if (line.startsWith("- [ ]")) {
                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            "w-4 h-4 rounded border flex-shrink-0",
                                            isTerminal ? "border-[#30363d]" : "border-border"
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            "text-xs",
                                            isTerminal ? "text-[#c9d1d9]" : "text-foreground"
                                        )}
                                    >
                                        {line.slice(6)}
                                    </span>
                                </div>
                            );
                        }

                        if (line === "<!-- pagebreak -->") {
                            return (
                                <div
                                    key={i}
                                    className="border border-dashed border-primary rounded px-3 py-1 text-center"
                                >
                                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                                        — Page Break —
                                    </span>
                                </div>
                            );
                        }

                        if (line.startsWith("$$") || line.startsWith("$$ ")) {
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "border rounded px-3 py-2 text-center text-xs font-mono",
                                        isTerminal
                                            ? "bg-[#161b22] border-[#30363d] text-[#f0883e]"
                                            : "bg-muted border-border text-primary"
                                    )}
                                >
                                    ∫ Math equation
                                </div>
                            );
                        }

                        const isSpecial =
                            line.startsWith("|") ||
                            line.startsWith("---") ||
                            line.startsWith("- ") ||
                            line.startsWith("#") ||
                            line.startsWith("`") ||
                            line.startsWith("$");

                        if (line.trim() && !isSpecial) {
                            const cleaned = line
                                .replace(/\*\*(.*?)\*\*/g, "$1")
                                .replace(/`(.*?)`/g, "$1");

                            return (
                                <p
                                    key={i}
                                    className={cn(
                                        "text-xs",
                                        theme === "manuscript" ? "leading-7" : "leading-5",
                                        isTerminal ? "text-[#c9d1d9]" : "text-foreground"
                                    )}
                                >
                                    {cleaned}
                                </p>
                            );
                        }

                        return null;
                    })}
                </div>
            </div>
        </div>
    );
};
