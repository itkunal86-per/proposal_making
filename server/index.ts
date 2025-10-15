import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin } from "./routes/auth";
import { handleAnalytics } from "./routes/analytics";
import { handleGhlTest, handleGhlSync } from "./routes/ghl";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/auth/login", handleLogin);
  app.post("/api/auth/login", handleLogin);

  // Analytics
  app.get("/api/analytics", handleAnalytics);

  return app;
}
