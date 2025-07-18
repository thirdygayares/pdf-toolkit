

const useTruncatedFilename = () => {
    const truncate = (filename: string, maxLength: number = 40): string => {
        const ext = filename.split('.').pop()
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "")

        if (filename.length <= maxLength) return filename

        const keepStart = Math.floor((maxLength - ext!.length - 5) / 2)
        const keepEnd = Math.ceil((maxLength - ext!.length - 5) / 2)

        const start = nameWithoutExt.slice(0, keepStart)
        const end = nameWithoutExt.slice(-keepEnd)

        return `${start}...${end}.${ext}`
    }

    return { truncate }
}

export default useTruncatedFilename;