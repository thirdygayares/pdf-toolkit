"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2 } from "lucide-react";

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

## Mermaid Diagram

\`\`\`mermaid
graph TD
    A[Upload Markdown] --> B{Has Diagrams?}
    B -- Yes --> C[Render Mermaid]
    B -- No --> D[Skip]
    C --> E[Export PDF]
    D --> E
\`\`\`

## Task List

- [x] Syntax highlighting
- [x] Math equations
- [ ] Custom CSS themes
- [ ] PlantUML support

## Table

| Feature      | Status      | Notes             |
|--------------|-------------|-------------------|
| Mermaid.js   | Supported   | Vector output     |
| KaTeX        | Supported   | Inline & display  |
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
}

export const EditorPane: React.FC<EditorPaneProps> = ({ value, onChange }) => {
    return (
        <div className="flex flex-col border rounded-xl overflow-hidden bg-card">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Markdown Editor
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => onChange(SAMPLE_MARKDOWN)}
                    >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => onChange("")}
                    >
                        <Trash2 className="h-3 w-3" />
                        Clear
                    </Button>
                </div>
            </div>

            {/* Textarea */}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                placeholder="Type or paste your Markdown here…"
                className="flex-1 resize-none p-4 text-sm font-mono bg-background text-foreground placeholder:text-muted-foreground focus:outline-none min-h-80"
            />
        </div>
    );
};
