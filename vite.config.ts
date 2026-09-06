import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Hash routes and relative assets work at /notebook/ on GitHub Pages,
  // at the preview root, and on a future custom domain without rebuilding paths.
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    // Playwright trace HTML is not application HTML: never hot-reload it.
    watch: {
      ignored: [
        "**/.cache/**",
        "**/test-results/**",
        "**/playwright-report/**",
        "**/tests/**",
        "**/docs/**",
      ],
    },
    allowedHosts: [".e2b.app", "localhost"],
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: [".e2b.app", "localhost"],
  },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
