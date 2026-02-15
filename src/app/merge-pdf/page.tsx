"use client"

import { useState } from "react"
import { UploadedFile } from "@/hooks/useFileUpload"
import { FileUpload } from "@/components/FileUpload"
import { Hero } from "@/app/merge-pdf/components/Hero"
import { FileManager } from "@/components/FileManager"
import { DownloadModal } from "@/components/DownloadModal"
import { toast } from "sonner"
import { useWarnBeforeCloseRefresh } from "@/hooks/useWarnBeforeCloseRefresh"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"


export default function HomePage() {
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)

    const handleFilesReady = (uploadedFiles: UploadedFile[]) => {
        setFiles(uploadedFiles)
    }

    const handleFilesChange = (newFiles: UploadedFile[]) => {
        setFiles(newFiles)
    }

    const handleMerge = () => {
        if (files.length > 0) {
            setIsDownloadModalOpen(true)
        }
    }

    const handleDownloadComplete = () => {
        setIsDownloadModalOpen(false)
        toast("Files merged and downloaded successfully!")
    }

    useWarnBeforeCloseRefresh(files.length > 0, "You have unsaved uploaded files. Are you sure you want to leave this page?")

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-6 sm:py-10">
                {files.length === 0 ? (
                    <section className="mx-auto max-w-5xl space-y-8 sm:space-y-10">
                        <FileUpload onFilesReady={handleFilesReady} />
                        <Hero />
                    </section>
                ) : (
                    <section className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Arrange and merge your PDFs</h1>
                            <p className="text-sm text-muted-foreground sm:text-base">
                                Reorder files by dragging, add more PDFs, then export one merged document.
                            </p>
                        </div>
                        <FileManager files={files} onFilesChange={handleFilesChange} onMerge={handleMerge} />
                    </section>
                )}

                <DownloadModal
                    open={isDownloadModalOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            setIsDownloadModalOpen(false)
                        }
                    }}
                    files={files}
                    onDownloadComplete={handleDownloadComplete}
                />
            </main>
            <Footer />
        </div>
    )
}
