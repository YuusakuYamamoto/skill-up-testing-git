import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    include: ["**/*.spec.ts", "**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/main.ts", "**/*.controller.ts", "**/*.spec.ts", "**/*.test.ts"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  plugins: [swc.vite()],
});
