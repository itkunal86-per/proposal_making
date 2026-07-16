import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { AuthUser } from "@/auth/AuthContext";

const SSO_STORAGE_KEY = "sso_auth_user";

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

    api
      .get<AuthUser>("/user")
      .then(({ data }) => {
        localStorage.setItem(SSO_STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event("sso-authenticated"));
        navigate("/my/proposals", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem(SSO_STORAGE_KEY);
        setError("Unable to complete SSO sign-in.");
      });
  }, [navigate, params]);

  if (error) return <div className="p-6 text-center text-destructive">{error}</div>;

  return <div className="p-6 text-center">Signing you in...</div>;
}
