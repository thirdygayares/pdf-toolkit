declare module "pdfjs-dist/build/pdf.mjs" {
    const pdfjsLib: any;
    export default pdfjsLib;
    export = pdfjsLib;
}

// Tell TS what a “?url” import returns.
declare module "pdfjs-dist/build/pdf.worker.mjs?url" {
    const src: string;
    export default src;
}

// (Optional) generic helper if you import other .mjs files as URLs
declare module "*.mjs?url" {
    const src: string;
    export default src;
}