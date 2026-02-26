import type { ComponentType } from "react"
import type { NodeConfigFormProps, NodeTypeDefinition, NodeTypeId } from "../types"
import { registryEntries } from "./entries"

export interface NodeRegistryEntry extends NodeTypeDefinition {
    configForm: ComponentType<NodeConfigFormProps>
}

const entries = registryEntries

const registry = new Map<NodeTypeId, NodeRegistryEntry>(entries.map((entry) => [entry.id, entry]))

export const nodeRegistry = registry

export const nodeRegistryEntries = entries

export const getNodeRegistryEntry = (id: NodeTypeId): NodeRegistryEntry => {
    const entry = registry.get(id)
    if (!entry) {
        throw new Error(`Unknown node type: ${id}`)
    }
    return entry
}
