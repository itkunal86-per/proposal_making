import { RequestHandler } from "express";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  remember: z.boolean().optional(),
});

function base64url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export const handleLogin: RequestHandler = (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        error: "Invalid credentials payload",
        issues: parsed.error.flatten(),
      });
  }
  const { email } = parsed.data;

  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    JSON.stringify({ sub: email, email, iat: now, exp: now + 60 * 60 * 8 }),
  );
  const signature = "signature"; // mock signature for demo purposes only
  const token = `${header}.${payload}.${signature}`;

  return res.json({ token, user: { email } });
};
