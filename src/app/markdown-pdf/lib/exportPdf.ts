import type { PageFormat, Theme } from "../components/PreviewPane";
type Rgb = [number, number, number];

type FontFamily = "helvetica" | "times" | "courier";

type ThemePalette = {
    bg: string;
    text: string;
    headingColor: string;
    codeBlock: string;
    codeBorder: string;
    codeText: string;
    blockquoteBorder: string;
    blockquoteText: string;
    tableHeaderBg: string;
    tableBorder: string;
    pageNumColor: string;
    linkColor: string;
    hrColor: string;
};

type ThemeTypography = {
    bodyFont: FontFamily;
    monoFont: "courier";
    baseSize: number;
    lineHeight: number;
    headingScale: Record<1 | 2 | 3, number>;
};

type ListItem = { checked: boolean | null; text: string };

type MarkdownBlock =
    | { kind: "heading"; level: 1 | 2 | 3; text: string }
    | { kind: "paragraph"; text: string }
    | { kind: "blockquote"; text: string }
    | { kind: "list"; items: ListItem[] }
    | { kind: "code"; language: string; code: string }
    | { kind: "table"; rows: string[][] }
    | { kind: "hr" }
    | { kind: "spacer" };

type PdfDocument = {
    addPage: (format?: [number, number]) => void;
    setPage: (page: number) => void;
    save: (filename: string) => void;
    splitTextToSize: (text: string, maxWidth: number) => string[];
    setFont: (fontName: FontFamily, fontStyle?: "normal" | "bold" | "italic") => void;
    setFontSize: (size: number) => void;
    setTextColor: (r: number, g: number, b: number) => void;
    setFillColor: (r: number, g: number, b: number) => void;
    setDrawColor: (r: number, g: number, b: number) => void;
    text: (text: string | string[], x: number, y: number, options?: { align?: "left" | "center" | "right" }) => void;
    rect: (x: number, y: number, width: number, height: number, style?: "S" | "F" | "FD" | "DF") => void;
    line: (x1: number, y1: number, x2: number, y2: number) => void;
    getTextWidth: (text: string) => number;
    internal: { getNumberOfPages: () => number };
};

type RenderContext = {
    pdf: PdfDocument;
    pageWidth: number;
    pageHeight: number;
    marginX: number;
    marginTop: number;
    marginBottom: number;
    contentWidth: number;
    y: number;
    palette: ThemePalette;
    typography: ThemeTypography;
};

const MM_PER_POINT = 0.352778;

// jsPDF page sizes in mm.
const JSPDF_FORMATS: Record<PageFormat, [number, number]> = {
    A4: [210, 297],
    Letter: [215.9, 279.4],
    Legal: [215.9, 355.6],
};

const THEME_PALETTE: Record<Theme, ThemePalette> = {
    documentation: {
        bg: "#ffffff",
        text: "#111827",
        headingColor: "#111827",
        codeBlock: "#f3f4f6",
        codeBorder: "#e5e7eb",
        codeText: "#1f2937",
        blockquoteBorder: "#d1d5db",
        blockquoteText: "#6b7280",
        tableHeaderBg: "#f9fafb",
        tableBorder: "#e5e7eb",
        pageNumColor: "#9ca3af",
        linkColor: "#2563eb",
        hrColor: "#e5e7eb",
    },
    manuscript: {
        bg: "#fefce8",
        text: "#1c1917",
        headingColor: "#1c1917",
        codeBlock: "#f5f5f4",
        codeBorder: "#e7e5e4",
        codeText: "#292524",
        blockquoteBorder: "#a8a29e",
        blockquoteText: "#78716c",
        tableHeaderBg: "#fafaf9",
        tableBorder: "#e7e5e4",
        pageNumColor: "#a8a29e",
        linkColor: "#1d4ed8",
        hrColor: "#e7e5e4",
    },
    terminal: {
        bg: "#0d1117",
        text: "#c9d1d9",
        headingColor: "#e6edf3",
        codeBlock: "#161b22",
        codeBorder: "#30363d",
        codeText: "#79c0ff",
        blockquoteBorder: "#30363d",
        blockquoteText: "#8b949e",
        tableHeaderBg: "#161b22",
        tableBorder: "#30363d",
        pageNumColor: "#6e7681",
        linkColor: "#58a6ff",
        hrColor: "#30363d",
    },
};

const THEME_TYPOGRAPHY: Record<Theme, ThemeTypography> = {
    documentation: {
        bodyFont: "helvetica",
        monoFont: "courier",
        baseSize: 11,
        lineHeight: 1.45,
        headingScale: { 1: 1.9, 2: 1.55, 3: 1.3 },
    },
    manuscript: {
        bodyFont: "times",
        monoFont: "courier",
        baseSize: 12,
        lineHeight: 1.75,
        headingScale: { 1: 1.8, 2: 1.45, 3: 1.25 },
    },
    terminal: {
        bodyFont: "courier",
        monoFont: "courier",
        baseSize: 10.5,
        lineHeight: 1.5,
        headingScale: { 1: 1.75, 2: 1.45, 3: 1.25 },
    },
};

function splitIntoPages(markdown: string): string[] {
    return markdown
        .split(/<!--\s*pagebreak\s*-->|\n\\newpage\n/i)
        .map((segment) => segment.trim())
        .filter(Boolean);
}

function ptToMm(points: number): number {
    return points * MM_PER_POINT;
}

function lineHeightMm(fontSizePt: number, multiplier: number): number {
    return ptToMm(fontSizePt * multiplier);
}

function hexToRgb(color: string): Rgb {
    const normalized = color.replace("#", "");
    const full = normalized.length === 3
        ? normalized
            .split("")
            .map((char) => `${char}${char}`)
            .join("")
        : normalized;

    const value = Number.parseInt(full, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return [r, g, b];
}

function setTextColor(pdf: PdfDocument, color: string): void {
    const [r, g, b] = hexToRgb(color);
    pdf.setTextColor(r, g, b);
}

function setFillColor(pdf: PdfDocument, color: string): void {
    const [r, g, b] = hexToRgb(color);
    pdf.setFillColor(r, g, b);
}

function setDrawColor(pdf: PdfDocument, color: string): void {
    const [r, g, b] = hexToRgb(color);
    pdf.setDrawColor(r, g, b);
}

function drawPageBackground(ctx: RenderContext): void {
    setFillColor(ctx.pdf, ctx.palette.bg);
    ctx.pdf.rect(0, 0, ctx.pageWidth, ctx.pageHeight, "F");
}

function startNewPage(ctx: RenderContext): void {
    ctx.pdf.addPage([ctx.pageWidth, ctx.pageHeight]);
    drawPageBackground(ctx);
    ctx.y = ctx.marginTop;
}

function ensureSpace(ctx: RenderContext, heightNeededMm: number): void {
    if (ctx.y + heightNeededMm <= ctx.pageHeight - ctx.marginBottom) return;
    startNewPage(ctx);
}

function inlineMarkdownToPlain(text: string): string {
    return text
        .replace(/!\[([^\]]*)]\(([^)]+)\)/g, "$1")
        .replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1 ($2)")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/__([^_]+)__/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/_([^_]+)_/g, "$1")
        .replace(/~~([^~]+)~~/g, "$1")
        .replace(/<[^>]+>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .trim();
}

function isTableDivider(line: string): boolean {
    return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function parseTableRow(line: string): string[] {
    const parts = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|");
    return parts.map((part) => inlineMarkdownToPlain(part.trim()));
}

function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const blocks: MarkdownBlock[] = [];
    let index = 0;
    let sawSpacer = false;

    const pushSpacer = () => {
        if (!sawSpacer) {
            blocks.push({ kind: "spacer" });
            sawSpacer = true;
        }
    };

    const pushBlock = (block: MarkdownBlock) => {
        blocks.push(block);
        sawSpacer = false;
    };

    while (index < lines.length) {
        const raw = lines[index];
        const trimmed = raw.trim();

        if (!trimmed) {
            pushSpacer();
            index += 1;
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length as 1 | 2 | 3;
            pushBlock({ kind: "heading", level, text: headingMatch[2].trim() });
            index += 1;
            continue;
        }

        const fenceMatch = trimmed.match(/^```(\w*)\s*$/);
        if (fenceMatch) {
            const language = fenceMatch[1] ?? "";
            const codeLines: string[] = [];
            index += 1;
            while (index < lines.length && !lines[index].trim().startsWith("```")) {
                codeLines.push(lines[index]);
                index += 1;
            }
            if (index < lines.length && lines[index].trim().startsWith("```")) {
                index += 1;
            }
            pushBlock({ kind: "code", language, code: codeLines.join("\n").trimEnd() });
            continue;
        }

        if (/^---+$/.test(trimmed) || /^___+$/.test(trimmed)) {
            pushBlock({ kind: "hr" });
            index += 1;
            continue;
        }

        if (trimmed.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1].trim())) {
            const rows: string[][] = [parseTableRow(trimmed)];
            index += 2;
            while (index < lines.length) {
                const row = lines[index].trim();
                if (!row || !row.includes("|")) break;
                rows.push(parseTableRow(row));
                index += 1;
            }
            pushBlock({ kind: "table", rows });
            continue;
        }

        if (/^>\s?/.test(trimmed)) {
            const quoteLines: string[] = [];
            while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
                quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
                index += 1;
            }
            pushBlock({ kind: "blockquote", text: quoteLines.join(" ") });
            continue;
        }

        if (/^[-*+]\s+/.test(trimmed)) {
            const items: ListItem[] = [];
            while (index < lines.length) {
                const match = lines[index].trim().match(/^[-*+]\s+(?:\[( |x|X)]\s+)?(.+)$/);
                if (!match) break;
                const marker = match[1];
                items.push({
                    checked: marker === undefined ? null : marker.toLowerCase() === "x",
                    text: match[2].trim(),
                });
                index += 1;
            }
            pushBlock({ kind: "list", items });
            continue;
        }

        const paragraphLines: string[] = [trimmed];
        index += 1;
        while (index < lines.length) {
            const next = lines[index].trim();
            if (!next) break;
            if (/^(#{1,3})\s+/.test(next)) break;
            if (/^```/.test(next)) break;
            if (/^>\s?/.test(next)) break;
            if (/^[-*+]\s+/.test(next)) break;
            if (/^---+$/.test(next) || /^___+$/.test(next)) break;
            if (next.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1].trim())) break;
            paragraphLines.push(next);
            index += 1;
        }
        pushBlock({ kind: "paragraph", text: paragraphLines.join(" ") });
    }

    while (blocks[blocks.length - 1]?.kind === "spacer") {
        blocks.pop();
    }

    return blocks;
}

function drawWrappedText(
    ctx: RenderContext,
    options: {
        text: string;
        font: FontFamily;
        style: "normal" | "bold" | "italic";
        fontSize: number;
        color: string;
        indent?: number;
        before?: number;
        after?: number;
        lineHeight?: number;
    }
): void {
    const content = inlineMarkdownToPlain(options.text);
    if (!content) return;

    const indent = options.indent ?? 0;
    const before = options.before ?? 0;
    const after = options.after ?? 0;
    const lineHeight = options.lineHeight ?? ctx.typography.lineHeight;

    if (before > 0) ctx.y += before;

    ctx.pdf.setFont(options.font, options.style);
    ctx.pdf.setFontSize(options.fontSize);
    setTextColor(ctx.pdf, options.color);

    const maxWidth = Math.max(15, ctx.contentWidth - indent);
    const lines = ctx.pdf.splitTextToSize(content, maxWidth);
    const lineHeightInMm = lineHeightMm(options.fontSize, lineHeight);

    for (const line of lines) {
        ensureSpace(ctx, lineHeightInMm);
        ctx.pdf.text(line, ctx.marginX + indent, ctx.y);
        ctx.y += lineHeightInMm;
    }

    if (after > 0) ctx.y += after;
}

function drawPreformattedBlock(
    ctx: RenderContext,
    lines: string[],
    options: { label?: string; fill: string; border: string; text: string }
): void {
    const fontSize = Math.max(9, ctx.typography.baseSize - 1);
    const lineHeight = lineHeightMm(fontSize, 1.35);
    const paddingX = 2.5;
    const paddingY = 2.2;
    const maxLineWidth = Math.max(15, ctx.contentWidth - paddingX * 2);

    ctx.pdf.setFont(ctx.typography.monoFont, "normal");
    ctx.pdf.setFontSize(fontSize);

    const wrapped: string[] = [];

    for (const sourceLine of lines.length ? lines : [""]) {
        const printable = sourceLine.replace(/\t/g, "  ");
        const row = printable.length ? ctx.pdf.splitTextToSize(printable, maxLineWidth) : [""];
        wrapped.push(...row);
    }

    const labelExtra = options.label ? lineHeightMm(fontSize - 1, 1.25) : 0;
    const blockHeight = paddingY * 2 + wrapped.length * lineHeight + labelExtra;

    ensureSpace(ctx, blockHeight + 3);

    setFillColor(ctx.pdf, options.fill);
    setDrawColor(ctx.pdf, options.border);
    ctx.pdf.rect(ctx.marginX, ctx.y, ctx.contentWidth, blockHeight, "FD");

    setTextColor(ctx.pdf, options.text);
    let cursorY = ctx.y + paddingY + lineHeight * 0.85;

    if (options.label) {
        ctx.pdf.setFontSize(fontSize - 1);
        ctx.pdf.text(`[${options.label}]`, ctx.marginX + paddingX, cursorY);
        cursorY += labelExtra;
        ctx.pdf.setFontSize(fontSize);
    }

    for (const line of wrapped) {
        ctx.pdf.text(line, ctx.marginX + paddingX, cursorY);
        cursorY += lineHeight;
    }

    ctx.y += blockHeight + 3;
}

function drawTable(ctx: RenderContext, rows: string[][]): void {
    if (!rows.length) return;

    const colCount = Math.max(...rows.map((row) => row.length), 1);
    const normalized = rows.map((row) => {
        const next = [...row];
        while (next.length < colCount) next.push("");
        return next;
    });

    const header = normalized[0];
    const body = normalized.slice(1);
    const renderedLines: string[] = [];
    renderedLines.push(header.join(" | "));
    renderedLines.push(new Array(colCount).fill("---").join(" | "));
    for (const row of body) {
        renderedLines.push(row.join(" | "));
    }

    drawPreformattedBlock(ctx, renderedLines, {
        label: "table",
        fill: ctx.palette.tableHeaderBg,
        border: ctx.palette.tableBorder,
        text: ctx.palette.text,
    });
}

function renderBlock(ctx: RenderContext, block: MarkdownBlock): void {
    switch (block.kind) {
        case "spacer":
            ctx.y += lineHeightMm(ctx.typography.baseSize, 0.45);
            return;
        case "heading": {
            const fontSize = Math.round(ctx.typography.baseSize * ctx.typography.headingScale[block.level]);
            drawWrappedText(ctx, {
                text: block.text,
                font: ctx.typography.bodyFont,
                style: "bold",
                fontSize,
                color: ctx.palette.headingColor,
                before: block.level === 1 ? 1.8 : 1.2,
                after: block.level === 1 ? 2.2 : 1.5,
                lineHeight: 1.25,
            });
            if (block.level === 1) {
                ensureSpace(ctx, 1.8);
                setDrawColor(ctx.pdf, ctx.palette.hrColor);
                ctx.pdf.line(ctx.marginX, ctx.y, ctx.marginX + ctx.contentWidth, ctx.y);
                ctx.y += 2;
            }
            return;
        }
        case "paragraph":
            drawWrappedText(ctx, {
                text: block.text,
                font: ctx.typography.bodyFont,
                style: "normal",
                fontSize: ctx.typography.baseSize,
                color: ctx.palette.text,
                after: lineHeightMm(ctx.typography.baseSize, 0.2),
            });
            return;
        case "blockquote": {
            const fontSize = Math.max(9, ctx.typography.baseSize - 0.5);
            const quoteIndent = 4;
            const lineHeight = lineHeightMm(fontSize, ctx.typography.lineHeight);
            const lines = ctx.pdf.splitTextToSize(inlineMarkdownToPlain(block.text), ctx.contentWidth - quoteIndent);
            ensureSpace(ctx, lines.length * lineHeight + 3);
            setFillColor(ctx.pdf, ctx.palette.blockquoteBorder);
            ctx.pdf.rect(ctx.marginX, ctx.y - 0.5, 0.9, lines.length * lineHeight + 1.5, "F");
            ctx.pdf.setFont(ctx.typography.bodyFont, "italic");
            ctx.pdf.setFontSize(fontSize);
            setTextColor(ctx.pdf, ctx.palette.blockquoteText);
            for (const line of lines) {
                ctx.pdf.text(line, ctx.marginX + quoteIndent, ctx.y);
                ctx.y += lineHeight;
            }
            ctx.y += 2;
            return;
        }
        case "list":
            for (const item of block.items) {
                const prefix = item.checked === null ? "-" : item.checked ? "[x]" : "[ ]";
                drawWrappedText(ctx, {
                    text: `${prefix} ${item.text}`,
                    font: ctx.typography.bodyFont,
                    style: "normal",
                    fontSize: ctx.typography.baseSize,
                    color: ctx.palette.text,
                    indent: 2,
                    after: lineHeightMm(ctx.typography.baseSize, 0.1),
                });
            }
            ctx.y += 1;
            return;
        case "code":
            drawPreformattedBlock(ctx, block.code.split("\n"), {
                label: block.language || undefined,
                fill: ctx.palette.codeBlock,
                border: ctx.palette.codeBorder,
                text: ctx.palette.codeText,
            });
            return;
        case "table":
            drawTable(ctx, block.rows);
            return;
        case "hr":
            ensureSpace(ctx, 2);
            setDrawColor(ctx.pdf, ctx.palette.hrColor);
            ctx.pdf.line(ctx.marginX, ctx.y, ctx.marginX + ctx.contentWidth, ctx.y);
            ctx.y += 2.5;
            return;
        default:
            return;
    }
}

function addPageNumbers(pdf: PdfDocument, pageWidth: number, pageHeight: number, typography: ThemeTypography, palette: ThemePalette): void {
    const totalPages = pdf.internal.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
        pdf.setPage(page);
        pdf.setFont(typography.bodyFont, "normal");
        pdf.setFontSize(8.5);
        setTextColor(pdf, palette.pageNumColor);
        pdf.text(`${page} / ${totalPages}`, pageWidth / 2, pageHeight - 7, { align: "center" });
    }
}

export async function exportMarkdownPdf(
    _pagesContainer: HTMLDivElement,
    pageFormat: PageFormat,
    filename = "document.pdf",
    markdown = "",
    theme: Theme = "documentation"
): Promise<void> {
    const { default: JsPdfCtor } = await import("jspdf");

    const [pageWidth, pageHeight] = JSPDF_FORMATS[pageFormat];
    const pdf = new JsPdfCtor({ orientation: "portrait", unit: "mm", format: [pageWidth, pageHeight] }) as unknown as PdfDocument;
    const palette = THEME_PALETTE[theme];
    const typography = THEME_TYPOGRAPHY[theme];

    const ctx: RenderContext = {
        pdf,
        pageWidth,
        pageHeight,
        marginX: 16,
        marginTop: 18,
        marginBottom: 14,
        contentWidth: pageWidth - 32,
        y: 18,
        palette,
        typography,
    };

    drawPageBackground(ctx);

    const logicalPages = splitIntoPages(markdown || " ");
    if (logicalPages.length === 0) {
        pdf.save(filename);
        return;
    }

    logicalPages.forEach((pageMarkdown, pageIndex) => {
        if (pageIndex > 0) {
            startNewPage(ctx);
        }

        const blocks = parseMarkdownBlocks(pageMarkdown);
        for (const block of blocks) {
            renderBlock(ctx, block);
        }
    });

    addPageNumbers(pdf, pageWidth, pageHeight, typography, palette);
    pdf.save(filename);
}
