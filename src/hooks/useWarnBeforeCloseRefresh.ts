import { useEffect } from "react"

export function useWarnBeforeCloseRefresh(enabled: boolean, warningMessage: string) {
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!enabled) return
            e.preventDefault()
            e.returnValue = warningMessage
            return warningMessage
        }

        window.addEventListener("beforeunload", handleBeforeUnload)

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [enabled, warningMessage])
}
