/**
 * Plain Vite + React + TanStack Router (file-based) — self-hostable SPA.
 *
 * Replaces the @lovable.dev preset that targeted Cloudflare Workers, so we
 * can build a static dist/ that nginx can serve from any Linux server.
 * Data still comes from the FastAPI backend at runtime — no SSR needed.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
  },
});
