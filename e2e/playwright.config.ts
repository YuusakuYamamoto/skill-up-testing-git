import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: 0,
  projects: [
    {
      name: "api",
      testMatch: "**/*.api.spec.ts",
      use: {
        baseURL: "http://localhost:3000",
      },
    },
    {
      name: "e2e",
      testMatch: "**/*.e2e.spec.ts",
      use: {
        baseURL: "http://localhost:5173",
        browserName: "chromium",
      },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter backend dev",
      port: 3000,
      reuseExistingServer: true,
      cwd: "../",
    },
    {
      command: "pnpm --filter frontend dev",
      port: 5173,
      reuseExistingServer: true,
      cwd: "../",
    },
  ],
});
