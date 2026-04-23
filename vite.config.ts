import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
  ],
  resolve: {
    alias: {
      "@": `${process.cwd()}/src`,
      "react": `${process.cwd()}/node_modules/react`,
      "react-dom": `${process.cwd()}/node_modules/react-dom`,
      "react/jsx-runtime": `${process.cwd()}/node_modules/react/jsx-runtime.js`,
      "react/jsx-dev-runtime": `${process.cwd()}/node_modules/react/jsx-dev-runtime.js`,
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
      "@privy-io/react-auth",
      "zustand",
    ],
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    watch: {
      ignored: [
        "**/.local/share/pnpm/**",
        "**/node_modules/.pnpm/**",
        "**/node_modules/.cache/**",
      ],
    },
  },
});
