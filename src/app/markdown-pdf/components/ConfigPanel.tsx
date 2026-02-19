"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { Theme } from "./PreviewPane";
import { Construction } from "lucide-react";

// ---------- Types ----------
type PageFormat = "A4" | "Letter" | "Legal";

interface FeatureChip {
    id: string;
    label: string;
}

// ---------- Constants ----------
const THEMES: { id: Theme; label: string; description: string }[] = [
    {
        id: "documentation",
        label: "Documentation",
        description: "Clean sans-serif, sidebar-style layout",
    },
    {
        id: "manuscript",
        label: "Manuscript",
        description: "Serif fonts, double-spaced, reading-friendly",
    },
    {
        id: "terminal",
        label: "Terminal",
        description: "Dark background with monospaced styling",
    },
];

const PAGE_FORMATS: PageFormat[] = ["A4", "Letter", "Legal"];

const FEATURE_CHIPS: FeatureChip[] = [
    { id: "syntax", label: "Syntax Highlighting" },
    { id: "mermaid", label: "Mermaid Diagrams" },
    { id: "math", label: "Math (KaTeX)" },
    { id: "gfm", label: "GitHub Flavored MD" },
    { id: "links", label: "Clickable Links" },
    { id: "toc", label: "Table of Contents" },
];

// ---------- Sub-components ----------
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {children}
        </p>
    );
}

interface ThemeCardProps {
    theme: (typeof THEMES)[number];
    active: boolean;
    onSelect: () => void;
}

function ThemeCard({ theme, active, onSelect }: ThemeCardProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                "flex-1 min-w-36 text-left border rounded-xl p-3 transition-colors",
                active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/40"
            )}
        >
            <div className="flex items-center gap-2 mb-1">
                <div
                    className={cn(
                        "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        active ? "border-primary" : "border-muted-foreground"
                    )}
                >
                    {active && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                </div>
                <span className="text-sm font-semibold text-foreground">
                    {theme.label}
                </span>
            </div>
            <p className="text-xs text-muted-foreground leading-tight pl-5">
                {theme.description}
            </p>
        </button>
    );
}

// ---------- Props ----------
interface ConfigPanelProps {
    selectedTheme: Theme;
    onThemeChange: (theme: Theme) => void;
}

// ---------- Main component ----------
export const ConfigPanel: React.FC<ConfigPanelProps> = ({
    selectedTheme,
    onThemeChange,
}) => {
    const [pageFormat, setPageFormat] = useState<PageFormat>("A4");
    const [enabledFeatures, setEnabledFeatures] = useState<Set<string>>(
        new Set(["syntax", "mermaid", "math", "gfm", "links"])
    );
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [justifyText, setJustifyText] = useState(false);
    const [avoidRowSplit, setAvoidRowSplit] = useState(true);
    const [showExportAlert, setShowExportAlert] = useState(false);

    function toggleFeature(id: string) {
        setEnabledFeatures((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function handleExport() {
        setShowExportAlert(true);
    }

    return (
        <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 lg:p-8 space-y-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    Export Configuration
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Set your theme, layout, and metadata before exporting to PDF.
                </p>
            </div>

            {/* Theme */}
            <div className="space-y-3">
                <SectionLabel>Theme</SectionLabel>
                <div className="flex flex-wrap gap-2">
                    {THEMES.map((t) => (
                        <ThemeCard
                            key={t.id}
                            theme={t}
                            active={selectedTheme === t.id}
                            onSelect={() => onThemeChange(t.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Page format */}
            <div className="space-y-3">
                <SectionLabel>Page Format</SectionLabel>
                <div className="flex gap-2">
                    {PAGE_FORMATS.map((fmt) => (
                        <button
                            key={fmt}
                            type="button"
                            onClick={() => setPageFormat(fmt)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors",
                                pageFormat === fmt
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted text-muted-foreground border-border hover:bg-muted/70"
                            )}
                        >
                            {fmt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rendering features */}
            <div className="space-y-3">
                <SectionLabel>Rendering Features</SectionLabel>
                <div className="flex flex-wrap gap-2">
                    {FEATURE_CHIPS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => toggleFeature(f.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                                enabledFeatures.has(f.id)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted text-muted-foreground border-border hover:bg-muted/70"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* PDF Metadata */}
            <div className="space-y-3">
                <SectionLabel>PDF Metadata</SectionLabel>
                <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="pdf-title" className="text-xs">
                            Title
                        </Label>
                        <Input
                            id="pdf-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Document title"
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="pdf-author" className="text-xs">
                            Author
                        </Label>
                        <Input
                            id="pdf-author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Author name"
                            className="h-9 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Layout options */}
            <div className="space-y-3">
                <SectionLabel>Layout Options</SectionLabel>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Switch
                            id="justify-text"
                            checked={justifyText}
                            onCheckedChange={setJustifyText}
                        />
                        <div>
                            <Label htmlFor="justify-text" className="text-sm font-semibold">
                                Justify Text
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Block-style alignment for a cleaner, printed look
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Switch
                            id="avoid-row-split"
                            checked={avoidRowSplit}
                            onCheckedChange={setAvoidRowSplit}
                        />
                        <div>
                            <Label htmlFor="avoid-row-split" className="text-sm font-semibold">
                                Avoid Row Splitting
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Prevents table rows from breaking across two pages
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page break info */}
            <div className="rounded-lg bg-muted/50 border border-border/70 p-4 space-y-1.5">
                <p className="text-sm font-semibold text-foreground">Page Breaks</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Insert{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary">
                        {"<!-- pagebreak -->"}
                    </code>{" "}
                    or{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary">
                        \newpage
                    </code>{" "}
                    in your Markdown to force a new page. H1–H3 headers are automatically kept
                    with the paragraph that follows them (widow/orphan control).
                </p>
            </div>

            {/* Coming soon alert — shown on export click */}
            {showExportAlert && (
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                    <Construction className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
                        <span className="font-semibold">Export is coming soon.</span> The Markdown to PDF
                        renderer is currently in development. Your configuration above is saved and will
                        be applied when the feature launches.
                    </AlertDescription>
                </Alert>
            )}

            {/* Export button */}
            <div className="space-y-2 pt-1">
                <Button
                    className="w-full h-11 text-base font-bold"
                    onClick={handleExport}
                >
                    Export PDF
                </Button>
                {!showExportAlert && (
                    <p className="text-xs text-muted-foreground text-center">
                        Generates a full PDF using the selected theme, features, and metadata.{" "}
                        <Badge variant="secondary" className="text-[10px]">
                            Coming Soon
                        </Badge>
                    </p>
                )}
            </div>
        </section>
    );
};
