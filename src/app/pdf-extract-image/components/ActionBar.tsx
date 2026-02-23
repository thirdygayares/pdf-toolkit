"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Download, RefreshCw, Trash2 } from "lucide-react";

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

    if (!hasItems) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 px-3 sm:px-4">
            <div className="pointer-events-auto mx-auto max-w-6xl rounded-2xl border border-border/80 bg-background/95 shadow-xl backdrop-blur">
                <div className="sm:hidden p-2.5">
                    <div className="space-y-2">
                        <Badge variant="secondary" className="w-fit border-primary/20 bg-primary/10 text-primary">
                            {selected} selected / {total} images
                        </Badge>

                        <div className="grid grid-cols-3 gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" variant="outline" size="sm" className="w-full justify-between px-3" disabled={busy}>
                                        Select
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-52">
                                    <DropdownMenuLabel>Selection</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => setAll(true)} disabled={busy}>
                                        <Check className="h-4 w-4" /> Select all
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setAll(false)} disabled={busy}>
                                        <RefreshCw className="h-4 w-4 rotate-180" /> Unselect all
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={invert} disabled={busy}>
                                        <RefreshCw className="h-4 w-4" /> Invert
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full px-2"
                                onClick={deleteSelected}
                                disabled={!hasSelected || busy}
                            >
                                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="w-full justify-between px-3"
                                        disabled={!hasItems || busy}
                                    >
                                        Export
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Downloads</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => void downloadSelected()} disabled={!hasSelected || busy}>
                                        <Download className="h-4 w-4" /> Download selected
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => void downloadAll()} disabled={!hasItems || busy}>
                                        <Download className="h-4 w-4" /> Download all
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <div className="hidden sm:block overflow-x-auto">
                    <div className="flex w-max min-w-full items-center gap-2 px-3 py-3 sm:px-4">
                        <Badge variant="secondary" className="shrink-0 border-primary/20 bg-primary/10 text-primary">
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

                        <div className="mx-1 h-6 w-px shrink-0 bg-border" />

                        <Button type="button" size="sm" onClick={downloadSelected} disabled={!hasSelected || busy}>
                            <Download className="mr-2 h-4 w-4" /> Download selected
                        </Button>
                        <Button type="button" variant="secondary" size="sm" onClick={downloadAll} disabled={!hasItems || busy}>
                            <Download className="mr-2 h-4 w-4" /> Download all
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
