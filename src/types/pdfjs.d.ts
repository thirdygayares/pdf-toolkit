declare module "pdfjs-dist/build/pdf" {
    import type { PDFDocumentLoadingTask } from "pdfjs-dist/types/src/display/api";

    export const GlobalWorkerOptions: {
        workerSrc: string;
    };

    export function getDocument(src: unknown): PDFDocumentLoadingTask;
}

declare module "pdfjs-dist/build/pdf.worker.min.js?url" {
    const src: string;
    export default src;
}
