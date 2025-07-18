"use client"

import { useState } from "react"
import {UploadedFile} from "@/hooks/useFileUpload";
import {FileUpload} from "@/components/FileUpload";
import {Hero} from "@/app/merge-pdf/components/Hero";
import {FileManager} from "@/components/FileManager";
import {DownloadModal} from "@/components/DownloadModal";
import {toast} from "sonner";


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

    return (
        <div className="min-h-screen bg-navy-50">
            <div className="container mx-auto px-4 py-8">
                {files.length === 0 ? (
                    <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
                        <Hero />
                        <FileUpload onFilesReady={handleFilesReady} />
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-navy-900 mb-2">Arrange & Merge PDFs</h1>
                            <p className="text-navy-600">Drag and drop to reorder your files before merging</p>
                        </div>
                        <FileManager files={files} onFilesChange={handleFilesChange} onMerge={handleMerge} />
                    </div>
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
            </div>
        </div>
    )
}
