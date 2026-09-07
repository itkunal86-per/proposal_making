import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { AuthUser } from "@/auth/AuthContext";

const SSO_STORAGE_KEY = "sso_auth_user";
const DEFAULT_SSO_DESTINATION = "/my/proposals";

function getSafeDestination(params: URLSearchParams) {
  const requestedDestination = [
    params.get("redirect"),
    params.get("redirect_url"),
    params.get("redirectUrl"),
    params.get("return_url"),
    params.get("returnUrl"),
    params.get("next"),
  ].find(Boolean);

  if (!requestedDestination) return DEFAULT_SSO_DESTINATION;

  try {
    const destination = new URL(requestedDestination, window.location.origin);

    if (
      destination.origin !== window.location.origin ||
      !destination.pathname.startsWith("/") ||
      destination.pathname === "/sso-login"
    ) {
      return DEFAULT_SSO_DESTINATION;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return DEFAULT_SSO_DESTINATION;
  }
}

export default function SsoLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setError("Missing SSO token.");
      return;
    }

    localStorage.setItem("access_token", token);
    localStorage.setItem("proposal_ai_auth_token", token);

    api
      .get<AuthUser>("/api/user")
      .then(({ data }) => {
        localStorage.setItem(SSO_STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event("sso-authenticated"));
        navigate(getSafeDestination(params), { replace: true });
      })
      .catch(() => {
        setError("Unable to complete SSO sign-in.");
      });
  }, [navigate, params]);

  if (error) return <div className="p-6 text-center text-destructive">{error}</div>;

  return <div className="p-6 text-center">Signing you in...</div>;
}
