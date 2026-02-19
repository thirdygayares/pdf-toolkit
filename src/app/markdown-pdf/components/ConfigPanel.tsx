"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Theme, PageFormat } from "./PreviewPane";
import { ChevronDown, Download, Eraser, Loader2, RotateCcw, Settings2 } from "lucide-react";

const THEMES: { id: Theme; label: string }[] = [
    { id: "documentation", label: "Documentation" },
    { id: "manuscript", label: "Manuscript" },
    { id: "terminal", label: "Terminal" },
];

const PAGE_FORMATS: PageFormat[] = ["A4", "Letter", "Legal"];

const SUPPORTED_CONTENT = ["Code fences", "Math equations", "Task lists", "Tables", "Page breaks"];

interface ConfigPanelProps {
    selectedTheme: Theme;
    onThemeChange: (theme: Theme) => void;
    pageFormat: PageFormat;
    onPageFormatChange: (fmt: PageFormat) => void;
    onExport: () => Promise<void>;
    onLoadSample: () => void;
    onClearEditor: () => void;
}

function MenuButton({ label, value }: { label: string; value: string }) {
    return (
        <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium">
            <span className="text-muted-foreground">{label}</span>
            <span>{value}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
    );
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
    selectedTheme,
    onThemeChange,
    pageFormat,
    onPageFormatChange,
    onExport,
    onLoadSample,
    onClearEditor,
}) => {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [justifyText, setJustifyText] = useState(false);
    const [avoidRowSplit, setAvoidRowSplit] = useState(true);
    const [exporting, setExporting] = useState(false);

    const activeThemeLabel = THEMES.find((theme) => theme.id === selectedTheme)?.label ?? "Theme";

    async function handleExport() {
        setExporting(true);
        try {
            await onExport();
        } finally {
            setExporting(false);
        }
    }

    return (
        <section className="sticky top-3 z-30 rounded-2xl border border-border/70 bg-card/90 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/75">
            <div className="flex flex-col gap-2 p-2.5 sm:p-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="mr-1 hidden rounded-lg border border-border/70 bg-muted/40 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:inline-block">
                        Menu
                    </div>

                    <div className="flex flex-1 flex-wrap items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span>
                                    <MenuButton label="Theme" value={activeThemeLabel} />
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel>Theme preset</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={selectedTheme} onValueChange={(value) => onThemeChange(value as Theme)}>
                                    {THEMES.map((theme) => (
                                        <DropdownMenuRadioItem key={theme.id} value={theme.id}>
                                            {theme.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span>
                                    <MenuButton label="Paper" value={pageFormat} />
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuLabel>Page size</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={pageFormat} onValueChange={(value) => onPageFormatChange(value as PageFormat)}>
                                    {PAGE_FORMATS.map((format) => (
                                        <DropdownMenuRadioItem key={format} value={format}>
                                            {format}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span>
                                    <MenuButton label="Layout" value="Options" />
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64">
                                <DropdownMenuLabel>Layout options</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem checked={justifyText} onCheckedChange={(checked) => setJustifyText(Boolean(checked))}>
                                    Justify text
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={avoidRowSplit} onCheckedChange={(checked) => setAvoidRowSplit(Boolean(checked))}>
                                    Avoid row split
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span>
                                    <MenuButton label="Metadata" value={title || author ? "Set" : "Empty"} />
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[280px]">
                                <DropdownMenuLabel>PDF metadata</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="space-y-2 p-2">
                                    <label className="block text-xs text-muted-foreground">
                                        Title
                                        <Input
                                            value={title}
                                            onChange={(event) => setTitle(event.target.value)}
                                            placeholder="Optional document title"
                                            className="mt-1 h-8 text-xs"
                                        />
                                    </label>
                                    <label className="block text-xs text-muted-foreground">
                                        Author
                                        <Input
                                            value={author}
                                            onChange={(event) => setAuthor(event.target.value)}
                                            placeholder="Optional author"
                                            className="mt-1 h-8 text-xs"
                                        />
                                    </label>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span>
                                    <MenuButton label="Support" value={`${SUPPORTED_CONTENT.length} items`} />
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-52">
                                <DropdownMenuLabel>Supported content</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {SUPPORTED_CONTENT.map((item) => (
                                    <div key={item} className="px-2 py-1.5 text-sm text-muted-foreground">
                                        {item}
                                    </div>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg px-2.5 text-xs" onClick={onLoadSample}>
                            <RotateCcw className="h-3.5 w-3.5" />
                            Sample
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg px-2.5 text-xs" onClick={onClearEditor}>
                            <Eraser className="h-3.5 w-3.5" />
                            Clear
                        </Button>
                        <Button size="sm" className="h-8 gap-1.5 rounded-lg px-2.5 text-xs" onClick={handleExport} disabled={exporting}>
                            {exporting ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-3.5 w-3.5" />
                                    Export PDF
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                    <span>Use {"<!-- pagebreak -->"} or \newpage on its own line to force a page break.</span>
                    <Settings2 className="h-3.5 w-3.5" />
                </div>
            </div>
        </section>
    );
};
