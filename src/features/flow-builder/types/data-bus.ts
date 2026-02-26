export type DataType = "pdf" | "text" | "images" | "pdf-list" | "any"

export type PacketMime = "application/pdf" | "text/plain" | string

export type ImagePacketItem = {
    name: string
    mimeType: string
    bytes: Uint8Array
}

export type PacketMeta = {
    fileName: string
    extension?: string
    mimeType?: PacketMime
    originalFileName?: string
    index?: number
    pageCount?: number
    skipped?: boolean
    notes?: string[]
    [key: string]: unknown
}

export type DataPayloadByType = {
    pdf: Uint8Array
    text: string
    images: ImagePacketItem[]
    "pdf-list": Uint8Array[]
    any: unknown
}

export interface DataPacket<TType extends DataType = DataType> {
    type: TType
    payload: DataPayloadByType[TType]
    meta: PacketMeta
}

export type PortDirection = "input" | "output"

export interface PortDefinition {
    id: string
    label: string
    direction: PortDirection
    dataType: DataType
    required?: boolean
    description?: string
}
