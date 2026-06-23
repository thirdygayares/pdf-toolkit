// Keeps public/pdf.worker.min.mjs in sync with the installed pdfjs-dist version.
// Prevents the "API version does not match the Worker version" error that occurs
// when pdfjs-dist is upgraded but the checked-in worker is not.
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const dest = resolve(root, "public/pdf.worker.min.mjs");

try {
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(source, dest);
    console.log(`[copy-pdf-worker] ${source} -> ${dest}`);
} catch (error) {
    console.error("[copy-pdf-worker] failed to copy pdfjs worker:", error);
    process.exit(1);
}
