"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Check, Download } from "lucide-react";

type Props = {
    total: number;
    selected: number;
    setAll: (v: boolean) => void;
    invert: () => void;
    downloadSelected: () => Promise<void>;
    downloadAll: () => Promise<void>;
};

export const ActionBar = ({ total, selected, setAll, invert, downloadSelected, downloadAll }: Props) => {
    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {selected} selected / {total} images
            </Badge>

            <Button variant="outline" size="sm" onClick={() => setAll(true)}>
                <Check className="h-4 w-4 mr-2" /> Select all
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAll(false)}>
                <RefreshCw className="h-4 w-4 mr-2 rotate-180" /> Unselect all
            </Button>
            <Button variant="outline" size="sm" onClick={invert}>
                <RefreshCw className="h-4 w-4 mr-2" /> Invert
            </Button>

            <div className="mx-2 w-px h-6 bg-border" />

            <Button size="sm" onClick={downloadSelected}>
                <Download className="h-4 w-4 mr-2" /> Download Selected (zip)
            </Button>
            <Button variant="secondary" size="sm" onClick={downloadAll}>
                <Download className="h-4 w-4 mr-2" /> Download All (zip)
            </Button>
        </div>
    );
};
