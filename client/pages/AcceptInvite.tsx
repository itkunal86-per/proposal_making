import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InviteRecord {
  token: string;
  userId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "invited" | "deactivated";
  createdAt: number;
}

const USERS_KEY = "app_users";
const INVITES_KEY = "app_invites";

function loadUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UserRecord[]) : [];
  } catch {
    return [];
  }
}
function saveUsers(users: UserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function loadInvites(): InviteRecord[] {
  try {
    const raw = localStorage.getItem(INVITES_KEY);
    return raw ? (JSON.parse(raw) as InviteRecord[]) : [];
  } catch {
    return [];
  }
}
function saveInvites(invites: InviteRecord[]) {
  localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
}

export default function AcceptInvite() {
  const { token = "" } = useParams();
  const [status, setStatus] = useState<
    "checking" | "ok" | "invalid" | "expired"
  >("checking");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const invites = loadInvites();
    const found = invites.find((i) => i.token === token);
    if (!found) {
      setStatus("invalid");
      return;
    }
    if (Date.now() > found.expiresAt) {
      setStatus("expired");
      return;
    }

    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === found.userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], status: "active" };
      saveUsers(users);
    }
    const remaining = invites.filter((i) => i.token !== token);
    saveInvites(remaining);
    setEmail(found.email);
    setStatus("ok");
  }, [token]);

  const title = useMemo(() => {
    switch (status) {
      case "checking":
        return "Validating invite...";
      case "ok":
        return "You're all set";
      case "invalid":
        return "Invalid invite";
      case "expired":
        return "Invite expired";
    }
  }, [status]);

  const desc = useMemo(() => {
    switch (status) {
      case "checking":
        return "Please wait";
      case "ok":
        return email
          ? `Invitation accepted for ${email}. Your account is now active.`
          : "Invitation accepted. Your account is now active.";
      case "invalid":
        return "This link is not valid.";
      case "expired":
        return "This link has expired. Please ask the admin to send a new invite.";
    }
  }, [status, email]);

  return (
    <section className="container py-16">
      <Card className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{desc}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/login">
            <Button variant="outline">Go to Login</Button>
          </Link>
          <Link to="/dashboard">
            <Button>Open Dashboard</Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
