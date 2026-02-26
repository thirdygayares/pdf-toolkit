import { bytesToBase64 } from "@/lib/bytesToBase64"
import type { DataPacket, NodeTypeId } from "../../types"
import type { NodeExecutor } from "../executor-types"

export const assertNotAborted = (signal?: AbortSignal) => {
    if (signal?.aborted) {
        throw new DOMException("Execution cancelled", "AbortError")
    }
}

export const ensurePdfPacket = (packet: DataPacket) => {
    if (packet.type !== "pdf") {
        throw new Error(`Expected PDF packet, received ${packet.type}`)
    }
    return packet as DataPacket<"pdf">
}

export const ensureTextPacket = (packet: DataPacket) => {
    if (packet.type !== "text") {
        throw new Error(`Expected text packet, received ${packet.type}`)
    }
    return packet as DataPacket<"text">
}

export const unsupportedExecutor = (nodeTypeId: NodeTypeId, message: string): NodeExecutor => {
    return async () => {
        throw new Error(`${nodeTypeId}: ${message}`)
    }
}

const toOwnedArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
    const view = new Uint8Array(bytes.byteLength)
    view.set(bytes)
    return view.buffer
}

export const uint8ToBlob = (bytes: Uint8Array, mimeType = "application/pdf") => {
    const buffer = toOwnedArrayBuffer(bytes)
    return new Blob([buffer], { type: mimeType })
}

export const toFileSafeName = (name: string, fallbackExt?: string) => {
    const trimmed = name.trim() || "output"
    const noControl = trimmed.replace(/[\\/:*?"<>|]+/g, "-")
    if (fallbackExt && !/\.[a-z0-9]+$/i.test(noControl)) {
        return `${noControl}.${fallbackExt.replace(/^\./, "")}`
    }
    return noControl
}

export const packetToBase64 = (packet: DataPacket<"pdf">) => bytesToBase64(packet.payload)
