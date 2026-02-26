"use client"

import { Button } from "@/components/ui/button"
import type { NodeConfigFormProps } from "@/features/flow-builder/types"
import { Field, Hint } from "./shared"

export default function PdfInputConfig({ runtime }: NodeConfigFormProps) {
    return (
        <div className="space-y-4">
            <Field label="Batch Files">
                <div className="space-y-2 rounded-lg border border-border/70 bg-surface/40 p-3">
                    <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                        onChange={(event) => {
                            const files = Array.from(event.target.files ?? [])
                            if (files.length > 0) {
                                runtime.addBatchFiles(files)
                            }
                            event.currentTarget.value = ""
                        }}
                    />
                    <Hint>Upload multiple PDFs. Each file is processed independently through the connected flow.</Hint>
                    <div className="space-y-2">
                        {runtime.batchFiles.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No PDFs uploaded yet.</p>
                        ) : (
                            runtime.batchFiles.map((file) => (
                                <div key={file.id} className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/70 px-2 py-1.5">
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-medium">{file.name}</p>
                                        <p className="text-[11px] text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => runtime.removeBatchFile(file.id)}>
                                        Remove
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                    {runtime.batchFiles.length > 0 && (
                        <Button type="button" variant="outline" size="sm" onClick={runtime.clearBatchFiles}>
                            Clear All
                        </Button>
                    )}
                </div>
            </Field>
        </div>
    )
}
