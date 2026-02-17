"use client";

import dynamic from "next/dynamic";

const PdfToImageClientPage = dynamic(() => import("./components/PdfToImageClientPage"), {
    ssr: false,
});

/**
 * Renders the client-only PDF-to-image page component.
 *
 * @returns The JSX element that mounts the client-side PdfToImageClientPage.
 */
export default function PdfToImageEntry() {
    return <PdfToImageClientPage />;
}