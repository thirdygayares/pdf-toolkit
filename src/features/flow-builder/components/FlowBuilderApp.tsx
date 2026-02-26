"use client"

import FlowCanvas from "./canvas/FlowCanvas"
import ConfigPanel from "./config-panel/ConfigPanel"
import { ExecutionPanel } from "./execution-panel"
import { FlowBuilderProvider } from "./FlowBuilderContext"
import NodePalette from "./sidebar/NodePalette"
import FlowToolbar from "./toolbar/FlowToolbar"

export default function FlowBuilderApp() {
    return (
        <FlowBuilderProvider>
            <div className="flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-background">
                <FlowToolbar />
                <div className="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)_320px] overflow-hidden">
                    <NodePalette />
                    <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
                        <div className="min-h-0 overflow-hidden">
                            <FlowCanvas />
                        </div>
                        <ExecutionPanel />
                    </div>
                    <ConfigPanel />
                </div>
            </div>
        </FlowBuilderProvider>
    )
}
