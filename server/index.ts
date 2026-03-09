import express, { Express } from "express";
import cors from "cors";

const EXTERNAL_API_URL = "https://api.dev.pitchsuite.io";

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

  // Proxy public proposal endpoint
  app.get("/api/public/proposal/:token", async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          error: "Invalid share token",
        });
      }

      const response = await fetch(
        `${EXTERNAL_API_URL}/api/public/proposal/${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Public proposal error:", error);
      res.status(500).json({
        error: "Failed to load proposal",
        message: "Please try again later",
      });
    }
  });

  // Send proposal email endpoint
  app.post("/api/send-proposal-email", async (req, res) => {
    try {
      const { to, from, subject, body, shareLink } = req.body;

      if (!to || !Array.isArray(to) || to.length === 0) {
        return res.status(400).json({
          error: "Invalid recipients",
        });
      }

      if (!from || !subject || !body) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      // For now, we'll just log and return success
      console.log("Email to be sent:", {
        to,
        from,
        subject,
        body,
        shareLink,
      });

      // Simulate email sending
      res.status(200).json({
        success: true,
        message: "Email sent successfully",
      });
    } catch (error) {
      console.error("Send email error:", error);
      res.status(500).json({
        error: "Failed to send email",
        message: "Please try again later",
      });
    }
  });

  return app;
}
