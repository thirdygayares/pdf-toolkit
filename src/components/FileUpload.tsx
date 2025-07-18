"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { FileIcon, Plus, X } from "lucide-react"
import {useFileUpload} from "@/hooks/useFileUpload";

interface FileUploadProps {
    onFilesReady: (files: any[]) => void
}

export function FileUpload({ onFilesReady }: FileUploadProps) {
    const { files, fileInputRef, removeFile, openFileDialog, handleFileInputChange, handleDrop } = useFileUpload()

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    return (
        <div
            className="bg-white rounded-2xl border-2 border-dashed border-navy-200 p-8"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="text-center space-y-6">
                <h2 className="text-2xl font-semibold text-navy-900">Upload your files</h2>

                {files.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                        {files.map((file) => (
                            <div key={file.id} className="relative">
                                <div className="border-2 border-navy-200 rounded-lg p-4 bg-navy-50">
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-10"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                            <FileIcon className="w-6 h-6 text-red-600" />
                                        </div>
                                        <p className="text-xs text-center text-navy-600 truncate w-full" title={file.name}>
                                            {file.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div
                            onClick={openFileDialog}
                            className="border-2 border-dashed border-navy-300 rounded-lg p-4 cursor-pointer hover:border-navy-400 hover:bg-navy-50"
                        >
                            <div className="flex flex-col items-center justify-center h-full space-y-2">
                                <Plus className="w-8 h-8 text-navy-600" />
                                <p className="text-sm text-navy-600 font-medium">Add more</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className="border-2 border-dashed border-navy-300 rounded-xl p-12 cursor-pointer hover:border-navy-400 hover:bg-navy-50"
                        onClick={openFileDialog}
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center">
                                <Plus className="w-8 h-8 text-navy-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-medium text-navy-900 mb-2">Drop PDF files here</p>
                                <p className="text-navy-600">or click to browse</p>
                            </div>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,application/pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                />

                <Button
                    size="lg"
                    className="bg-primary hover:bg-navy-800 text-white px-8 py-3"
                    disabled={files.length === 0}
                    onClick={() => onFilesReady(files)}
                >
                    {files.length === 0 ? "Select Files" : `Merge ${files.length} Files`}
                </Button>

                <p className="text-sm text-navy-500">Upload unlimited PDF files, max 100MB each</p>
            </div>
        </div>
    )
}
