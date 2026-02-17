"use client";

import dynamic from "next/dynamic";

const PdfToImageClientPage = dynamic(() => import("./components/PdfToImageClientPage"), {
    ssr: false,
});

export default function PdfToImageEntry() {
    return <PdfToImageClientPage />;
}
