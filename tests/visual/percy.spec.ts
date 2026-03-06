import path from "node:path"

import { expect, test, type Page } from "@playwright/test"
import percySnapshot from "@percy/playwright"

const testPdfPath = path.resolve(process.cwd(), "public/test-pdf.pdf")

async function uploadPdf(page: Page) {
    await page.locator('input[type="file"]').first().setInputFiles(testPdfPath)
}

test.describe.configure({ mode: "serial" })

test.describe("Percy upload flows", () => {
    test("pdf editor upload state", async ({ page }) => {
        await page.goto("/pdf-editor")
        await expect(
            page.getByRole("heading", { level: 1, name: "Full-Suite PDF Editor & Annotator" })
        ).toBeVisible()

        await uploadPdf(page)

        await expect(page.getByRole("button", { name: "Export PDF" })).toBeVisible({ timeout: 30_000 })
        await expect(page.getByRole("button", { name: "Insert PDF" })).toBeVisible()

        await percySnapshot(page, "PDF Editor - Uploaded PDF")
    })

    test("pdf extract text upload state", async ({ page }) => {
        await page.goto("/pdf-extract-text")
        await expect(page.getByText("Upload your PDFs")).toBeVisible()

        await uploadPdf(page)

        await expect(page.getByText("Select pages to extract")).toBeVisible({
            timeout: 30_000,
        })
        await expect(page.getByText(/Files:\s*1/i)).toBeVisible()

        await percySnapshot(page, "PDF Extract Text - Uploaded PDF")
    })

    test("split pdf upload state", async ({ page }) => {
        await page.goto("/split-pdf")
        await expect(page.getByText("Upload your PDFs")).toBeVisible()

        await uploadPdf(page)

        await expect(page.getByRole("button", { name: "Split & download" })).toBeVisible({ timeout: 30_000 })
        await expect(page.getByText(/Selected\s+\d+\s+of\s+\d+\s+pages/i)).toBeVisible()

        await percySnapshot(page, "Split PDF - Uploaded PDF")
    })

    test("pdf extract image upload state", async ({ page }) => {
        await page.goto("/pdf-extract-image")
        await expect(page.getByText("Upload your PDFs")).toBeVisible()

        await uploadPdf(page)

        await expect(page.getByText("1 PDF selected")).toBeVisible({ timeout: 30_000 })
        await expect(page.getByRole("button", { name: "Extract images", exact: true })).toBeVisible()

        await percySnapshot(page, "PDF Extract Image - Uploaded PDF")
    })
})
