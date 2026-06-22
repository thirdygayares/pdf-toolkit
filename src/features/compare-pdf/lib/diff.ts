/**
 * Sequence diffing used to compare two pages' text runs.
 *
 * We diff the *ordered list of run strings* from each page. Runs that land in the
 * longest common subsequence are "equal"; left-only runs are "removed" and
 * right-only runs are "added".
 */

import type { RunStatus } from "../types"

/** Collapse whitespace and trim so trivial spacing differences don't count as changes. */
export function normalizeRunText(value: string): string {
    return value.replace(/\s+/g, " ").trim()
}

export interface SequenceDiff {
    leftStatus: RunStatus[]
    rightStatus: RunStatus[]
}

// Above this DP cell count we fall back to a cheaper multiset diff to avoid
// allocating a huge matrix on pathological pages.
const MAX_DP_CELLS = 1_000_000

/**
 * Diff two ordered string sequences. Returns a status for every element on each
 * side: "equal" for matched items, "removed" for left-only, "added" for right-only.
 */
export function diffSequences(left: string[], right: string[]): SequenceDiff {
    const n = left.length
    const m = right.length

    if (n === 0 || m === 0 || n * m > MAX_DP_CELLS) {
        return multisetDiff(left, right)
    }

    // dp[i][j] = LCS length of left[i:] and right[j:].
    const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
    for (let i = n - 1; i >= 0; i -= 1) {
        const row = dp[i]
        const next = dp[i + 1]
        for (let j = m - 1; j >= 0; j -= 1) {
            row[j] = left[i] === right[j] ? next[j + 1] + 1 : Math.max(next[j], row[j + 1])
        }
    }

    const leftStatus: RunStatus[] = new Array(n).fill("removed")
    const rightStatus: RunStatus[] = new Array(m).fill("added")

    let i = 0
    let j = 0
    while (i < n && j < m) {
        if (left[i] === right[j]) {
            leftStatus[i] = "equal"
            rightStatus[j] = "equal"
            i += 1
            j += 1
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            i += 1
        } else {
            j += 1
        }
    }

    return { leftStatus, rightStatus }
}

/**
 * Order-insensitive fallback: an item is "equal" if a matching item (by value and
 * remaining multiplicity) exists on the other side. Used only for very large pages.
 */
function multisetDiff(left: string[], right: string[]): SequenceDiff {
    const counts = new Map<string, number>()
    for (const value of right) {
        counts.set(value, (counts.get(value) ?? 0) + 1)
    }

    const leftStatus: RunStatus[] = left.map((value) => {
        const remaining = counts.get(value) ?? 0
        if (remaining > 0) {
            counts.set(value, remaining - 1)
            return "equal"
        }
        return "removed"
    })

    const matched = new Map<string, number>()
    for (const value of left) {
        matched.set(value, (matched.get(value) ?? 0) + 1)
    }
    // Recount what the left actually consumed as "equal".
    const consumable = new Map<string, number>()
    for (let index = 0; index < left.length; index += 1) {
        if (leftStatus[index] === "equal") {
            consumable.set(left[index], (consumable.get(left[index]) ?? 0) + 1)
        }
    }

    const rightStatus: RunStatus[] = right.map((value) => {
        const remaining = consumable.get(value) ?? 0
        if (remaining > 0) {
            consumable.set(value, remaining - 1)
            return "equal"
        }
        return "added"
    })

    return { leftStatus, rightStatus }
}
