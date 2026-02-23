"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Download, RefreshCw, Trash2 } from "lucide-react";

type Props = {
    total: number;
    selected: number;
    busy?: boolean;
    setAll: (v: boolean) => void;
    invert: () => void;
    deleteSelected: () => void;
    downloadSelected: () => Promise<void>;
    downloadAll: () => Promise<void>;
};

export const ActionBar = ({
    total,
    selected,
    busy = false,
    setAll,
    invert,
    deleteSelected,
    downloadSelected,
    downloadAll,
}: Props) => {
    const hasItems = total > 0;
    const hasSelected = selected > 0;

    return (
        <div className="rounded-xl border border-border/80 bg-card p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary">
                    {selected} selected / {total} images
                </Badge>

                <Button type="button" variant="outline" size="sm" onClick={() => setAll(true)} disabled={!hasItems || busy}>
                    <Check className="mr-2 h-4 w-4" /> Select all
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setAll(false)} disabled={!hasItems || busy}>
                    <RefreshCw className="mr-2 h-4 w-4 rotate-180" /> Unselect all
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={invert} disabled={!hasItems || busy}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Invert
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={deleteSelected} disabled={!hasSelected || busy}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete selected
                </Button>

                <div className="hidden h-6 w-px bg-border sm:block" />

                <Button type="button" size="sm" onClick={downloadSelected} disabled={!hasSelected || busy}>
                    <Download className="mr-2 h-4 w-4" /> Zip selected
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={downloadAll} disabled={!hasItems || busy}>
                    <Download className="mr-2 h-4 w-4" /> Zip all
                </Button>
            </div>
        </div>
    );
};
