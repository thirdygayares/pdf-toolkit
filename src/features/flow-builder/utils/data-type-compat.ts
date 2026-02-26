import type { DataType } from "../types"

export const isDataTypeCompatible = (source: DataType, target: DataType) => {
    if (source === "any" || target === "any") return true
    return source === target
}
