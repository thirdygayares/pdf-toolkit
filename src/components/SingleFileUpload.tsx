import { useSingleFileUpload } from "@/hooks/useSingleFileUpload"
import { FileIcon, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SingleFileUpload({ onFileReady }: { onFileReady: (file: File) => void }) {
    const { file, fileInputRef, openFileDialog, removeFile, handleInputChange, handleDrop } = useSingleFileUpload()

    return (
        <div
            className="bg-white rounded-2xl border-2 border-dashed border-navy-200 p-8"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className="text-center space-y-6">
                <h2 className="text-2xl font-semibold text-navy-900">Upload PDF</h2>

                {file ? (
                    <div className="max-w-xs mx-auto relative">
                        <div className="border-2 border-navy-200 rounded-lg p-4 bg-navy-50">
                            <button
                                onClick={removeFile}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FileIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <p className="text-sm text-center text-navy-700 truncate w-full">{file.name}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={openFileDialog}
                        className="border-2 border-dashed border-navy-300 rounded-xl p-12 cursor-pointer hover:border-navy-400 hover:bg-navy-50"
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center">
                                <Plus className="w-8 h-8 text-navy-600" />
                            </div>
                            <p className="text-lg font-medium text-navy-900 mb-2">Drop a PDF file here</p>
                            <p className="text-navy-600">or click to browse</p>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleInputChange}
                    className="hidden"
                />

                <Button
                    size="lg"
                    disabled={!file}
                    onClick={() => file && onFileReady(file.file)}
                >
                    {file ? "Extract Text" : "Select PDF"}
                </Button>
            </div>
        </div>
    )
}
