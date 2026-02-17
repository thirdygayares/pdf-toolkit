"use client"

import dynamic from "next/dynamic"

const ExtractTextClientPage = dynamic(() => import("./components/ExtractTextClientPage"), {
    ssr: false,
})

export default function ExtractTextEntry() {
    return <ExtractTextClientPage />
}
