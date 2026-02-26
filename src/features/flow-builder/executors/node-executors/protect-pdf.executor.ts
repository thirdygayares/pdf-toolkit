import { encryptPdfBytes, type PdfPermissions } from "@/lib/pdfEncrypt"
import type { NodeExecutor } from "../executor-types"
import { ensurePdfPacket } from "./_shared"

export const protectPdfExecutor: NodeExecutor = async ({ packet, config }) => {
    const pdfPacket = ensurePdfPacket(packet)

    const userPassword = String(config.userPassword ?? "")
    const ownerPassword = String(config.ownerPassword ?? "") || userPassword

    if (!userPassword && !ownerPassword) {
        throw new Error("Protect PDF requires a user or owner password.")
    }

    const permissions: PdfPermissions = {
        printing: Boolean(config.printing ?? true),
        modifying: Boolean(config.modifying ?? true),
        copying: Boolean(config.copying ?? true),
        annotating: Boolean(config.annotating ?? true),
    }

    const protectedBytes = encryptPdfBytes(pdfPacket.payload, {
        userPassword,
        ownerPassword,
        permissions,
    })

    return {
        ...pdfPacket,
        payload: protectedBytes,
    }
}
