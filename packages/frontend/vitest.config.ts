import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/test-setup.ts", "**/*.test.*"],
      thresholds: {
        statements: 30,
        branches: 30,
        functions: 30,
        lines: 30,
      },
    },
  },
});
