import { defineConfig, devices } from "@playwright/test"

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3107)

export default defineConfig({
    testDir: "./tests/visual",
    fullyParallel: true,
    retries: process.env.CI ? 2 : 0,
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: `http://127.0.0.1:${port}`,
        trace: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                viewport: { width: 1440, height: 1200 },
            },
        },
    ],
    webServer: {
        command: `npm run build && npm run start -- --hostname 127.0.0.1 -p ${port}`,
        url: `http://127.0.0.1:${port}`,
        reuseExistingServer: false,
        timeout: 180_000,
    },
})
