import type { NodeExecutor } from "../executor-types"

const formatTimestamp = () => {
    const now = new Date()
    return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
        "-",
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
        String(now.getSeconds()).padStart(2, "0"),
    ].join("")
}

export const renameExecutor: NodeExecutor = async ({ packet, config }) => {
    const originalBase = String(packet.meta.fileName || "output")
    const ext = String(packet.meta.extension || (packet.type === "text" ? "txt" : "pdf"))
    const pattern = String(config.pattern ?? "{name}-processed")
    const nextName = pattern
        .replaceAll("{name}", originalBase)
        .replaceAll("{ext}", ext)
        .replaceAll("{index}", String((packet.meta.index as number | undefined ?? 0) + 1))
        .replaceAll("{timestamp}", formatTimestamp())
        .trim()

    return {
        ...packet,
        meta: {
            ...packet.meta,
            fileName: nextName || originalBase,
        },
    }
}
