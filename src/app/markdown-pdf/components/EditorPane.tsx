"use client";

export const SAMPLE_MARKDOWN = `# Technical User Manual

## Introduction

This document demonstrates the **Markdown to PDF** converter capabilities.

\`\`\`python
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

## Math Equations

Inline: $ E = mc^2 $

Display:
$$ \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2} $$

## Task List

- [x] Syntax highlighting
- [x] Math equations
- [ ] Custom CSS themes
- [ ] PlantUML support

## Table

| Feature      | Status      | Notes             |
|--------------|-------------|-------------------|
| Code blocks  | Supported   | Fenced syntax     |
| KaTeX        | Supported   | Inline & display  |
| Page Breaks  | Supported   | Manual markers    |
| Custom CSS   | Coming Soon | Advanced option   |

<!-- pagebreak -->

## Chapter 2

Content pushed to next page via the page break above.

> This is a blockquote demonstrating **widow/orphan** control.
> Headers will never be stranded at the bottom of a page.
`;

interface EditorPaneProps {
    value: string;
    onChange: (value: string) => void;
    /** When true, fills parent height (used in resizable split layout) */
    fullHeight?: boolean;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ value, onChange, fullHeight }) => {
    const lineCount = value ? value.split("\n").length : 0;

    return (
        <div className={`flex flex-col border-r bg-card ${fullHeight ? "h-full" : "border rounded-xl overflow-hidden"}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-muted/40 flex-shrink-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Markdown Editor
                </span>
                <span className="text-[11px] text-muted-foreground">{lineCount} {lineCount === 1 ? "line" : "lines"}</span>
            </div>

            {/* Textarea */}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                placeholder="Type or paste your Markdown here…"
                className="flex-1 resize-none p-4 text-sm font-mono bg-background text-foreground placeholder:text-muted-foreground focus:outline-none min-h-80 h-full"
            />
        </div>
    );
};
