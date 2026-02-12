import express, { Express } from "express";
import cors from "cors";

const EXTERNAL_API_URL = "https://propai-api.hirenq.com";

export function createServer(): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong" });
  });

  // Proxy register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const response = await fetch(`${EXTERNAL_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        error: "Failed to reach authentication server",
        message: "Please try again later",
      });
    }
  });

  // Proxy login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const response = await fetch(`${EXTERNAL_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: "Failed to reach authentication server",
        message: "Please try again later",
      });
    }
  });

  return app;
}
