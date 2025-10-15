import type { RequestHandler } from "express";

export const handleGhlTest: RequestHandler = (req, res) => {
  // Do NOT log secrets. Basic validation without contacting external APIs.
  const apiKey = (req.header("x-ghl-key") || "").trim();
  const location = (req.header("x-ghl-location") || "").trim();
  if (!apiKey || apiKey.length < 10) return res.status(400).json({ ok: false, error: "Invalid API key" });
  if (!location) return res.status(400).json({ ok: false, error: "Location ID required" });
  return res.json({ ok: true });
};

export const handleGhlSync: RequestHandler = (req, res) => {
  // This endpoint receives client/proposal counts to acknowledge a sync request.
  // In a production implementation, proxy to the GoHighLevel API here using server-side secrets.
  const { clients = 0, proposals = 0 } = req.body ?? {};
  if (Number.isNaN(Number(clients)) || Number.isNaN(Number(proposals))) {
    return res.status(400).json({ ok: false, error: "Invalid payload" });
  }
  return res.json({ ok: true, clients: Number(clients), proposals: Number(proposals) });
};
