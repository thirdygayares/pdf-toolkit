const useTruncatedFilename = () => {
    const truncate = (filename: string, maxLength: number = 40): string => {
        const dotIndex = filename.lastIndexOf(".")
        const hasExtension = dotIndex !== -1
        const ext = hasExtension ? filename.slice(dotIndex + 1) : ""
        const nameWithoutExt = hasExtension ? filename.slice(0, dotIndex) : filename

        if (filename.length <= maxLength) return filename

        const reserved = 3 + (hasExtension ? ext.length + 1 : 0) // ellipsis + optional dot and extension
        const keepStart = Math.floor((maxLength - reserved) / 2)
        const keepEnd = Math.ceil((maxLength - reserved) / 2)

        const start = nameWithoutExt.slice(0, keepStart)
        const end = nameWithoutExt.slice(-keepEnd)

        return hasExtension ? `${start}...${end}.${ext}` : `${start}...${end}`
    }

    return { truncate }
}

export default useTruncatedFilename

