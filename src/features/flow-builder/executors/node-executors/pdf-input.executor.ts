import type { DataPacket } from "../../types"

export const fileToPdfPacket = async ({
    id,
    file,
    index,
}: {
    id: string
    file: File
    index: number
}): Promise<DataPacket<"pdf">> => {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const baseName = file.name.replace(/\.pdf$/i, "") || `file-${index + 1}`

    return {
        type: "pdf",
        payload: bytes,
        meta: {
            fileId: id,
            fileName: baseName,
            extension: "pdf",
            mimeType: file.type || "application/pdf",
            originalFileName: file.name,
            index,
        },
    }
}
