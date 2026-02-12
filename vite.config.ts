import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer as createExpressServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    {
      name: "express-server",
      apply: "serve",
      configureServer(viteServer) {
        const expressApp = createExpressServer();

        // Attach Express to Vite's middleware stack
        viteServer.middlewares.use(expressApp);

        return () => {};
      },
    },
  ],
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
