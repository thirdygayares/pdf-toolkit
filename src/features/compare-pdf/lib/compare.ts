"use client"

/**
 * Builds a CompareResult from two loaded PDF documents: extracts text geometry
 * for every page, aligns pages by page number, diffs the text runs, and rolls up
 * a summary.
 */

import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import type {
    ComparePagePair,
    ComparePageView,
    CompareResult,
    CompareSummary,
    PageRun,
} from "../types"
import { diffSequences, normalizeRunText } from "./diff"
import { extractPageGeometry, type RawRun } from "./pdf"

export interface CompareProgress {
    page: number
    totalPages: number
}

export interface CompareOptions {
    onProgress?: (progress: CompareProgress) => void
}

/** Diff one page pair and return the two views with per-run statuses applied. */
async function buildPagePair(
    pageNumber: number,
    leftDoc: PDFDocumentProxy | null,
    rightDoc: PDFDocumentProxy | null,
): Promise<ComparePagePair> {
    const leftGeometry = leftDoc ? await extractPageGeometry(leftDoc, pageNumber) : null
    const rightGeometry = rightDoc ? await extractPageGeometry(rightDoc, pageNumber) : null

    const leftRaw: RawRun[] = leftGeometry?.runs ?? []
    const rightRaw: RawRun[] = rightGeometry?.runs ?? []

    const { leftStatus, rightStatus } = diffSequences(
        leftRaw.map((run) => normalizeRunText(run.text)),
        rightRaw.map((run) => normalizeRunText(run.text)),
    )

    const leftRuns: PageRun[] = leftRaw.map((run, index) => ({ ...run, status: leftStatus[index] }))
    const rightRuns: PageRun[] = rightRaw.map((run, index) => ({ ...run, status: rightStatus[index] }))

    const leftChanges = leftRuns.filter((run) => run.status !== "equal").length
    const rightChanges = rightRuns.filter((run) => run.status !== "equal").length

    const leftView: ComparePageView | null = leftGeometry
        ? {
              pageNumber,
              width: leftGeometry.width,
              height: leftGeometry.height,
              runs: leftRuns,
              changeCount: leftChanges,
          }
        : null

    const rightView: ComparePageView | null = rightGeometry
        ? {
              pageNumber,
              width: rightGeometry.width,
              height: rightGeometry.height,
              runs: rightRuns,
              changeCount: rightChanges,
          }
        : null

    // A page that exists on only one side is always a difference.
    const oneSidedOnly = (leftView && !rightView) || (!leftView && rightView)
    const changeCount = leftChanges + rightChanges
    const hasDiff = changeCount > 0 || Boolean(oneSidedOnly)

    return { pageNumber, left: leftView, right: rightView, hasDiff, changeCount }
}

export async function compareDocuments(
    leftDoc: PDFDocumentProxy,
    rightDoc: PDFDocumentProxy,
    leftName: string,
    rightName: string,
    options?: CompareOptions,
): Promise<CompareResult> {
    const leftPageCount = leftDoc.numPages
    const rightPageCount = rightDoc.numPages
    const totalPages = Math.max(leftPageCount, rightPageCount)

    const pairs: ComparePagePair[] = []
    let added = 0
    let removed = 0
    let pagesWithDiff = 0

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        options?.onProgress?.({ page: pageNumber, totalPages })

        const pair = await buildPagePair(
            pageNumber,
            pageNumber <= leftPageCount ? leftDoc : null,
            pageNumber <= rightPageCount ? rightDoc : null,
        )

        pairs.push(pair)
        if (pair.hasDiff) {
            pagesWithDiff += 1
        }
        added += pair.right?.runs.filter((run) => run.status === "added").length ?? 0
        removed += pair.left?.runs.filter((run) => run.status === "removed").length ?? 0
    }

    const summary: CompareSummary = {
        totalPages,
        pagesWithDiff,
        added,
        removed,
        identical: pagesWithDiff === 0 && leftPageCount === rightPageCount,
    }

    return { leftName, rightName, leftPageCount, rightPageCount, pairs, summary }
}
