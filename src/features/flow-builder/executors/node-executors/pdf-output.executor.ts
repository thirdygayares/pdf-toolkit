import JSZip from "jszip"
import { toFileSafeName, uint8ToBlob } from "./_shared"
import type { DataPacket } from "../../types"
import type { OutputPackager } from "../executor-types"

const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
}

const packetToBlobAndName = (packet: DataPacket, index: number) => {
    const base = String(packet.meta.fileName || `output-${index + 1}`)
    if (packet.type === "pdf") {
        const payload = packet.payload as Uint8Array
        return {
            name: toFileSafeName(base, "pdf"),
            blob: uint8ToBlob(payload, packet.meta.mimeType ?? "application/pdf"),
        }
    }

    if (packet.type === "text") {
        const payload = packet.payload as string
        return {
            name: toFileSafeName(base, "txt"),
            blob: new Blob([payload], { type: packet.meta.mimeType ?? "text/plain" }),
        }
    }

    throw new Error(`Unsupported output packet type: ${packet.type}`)
}

export const packageOutputPackets: OutputPackager = async ({ packets, config, flowName }) => {
    const archiveBase = String(config.archiveName ?? flowName ?? "flow-output").trim() || "flow-output"
    const packageMode = String(config.packageMode ?? "auto")
    const filtered = packets.filter((packet) => !packet.meta.skipped)

    if (filtered.length === 0) {
        return { outputCount: 0 }
    }

    if (filtered.length === 1 && packageMode !== "zip") {
        const single = packetToBlobAndName(filtered[0], 0)
        triggerDownload(single.blob, single.name)
        return { fileName: single.name, outputCount: 1 }
    }

    const zip = new JSZip()
    filtered.forEach((packet, index) => {
        const item = packetToBlobAndName(packet, index)
        zip.file(item.name, item.blob)
    })

    const zipBlob = await zip.generateAsync({ type: "blob" })
    const zipName = `${toFileSafeName(archiveBase)}.zip`
    triggerDownload(zipBlob, zipName)
    return { fileName: zipName, outputCount: filtered.length }
}
