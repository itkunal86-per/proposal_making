import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/index.ts"),
      name: "server",
      fileName: "node-build",
      formats: ["es"],
    },
    outDir: "dist/server",
    emptyOutDir: true,
    minify: false,
    ssr: true,
    rollupOptions: {
      external: ["express", "cors"],
      output: {
        entryFileNames: "[name].mjs",
      },
    },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
