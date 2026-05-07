import { useCallback, useEffect, useState } from "react";

const ADMIN_AUTH_KEY = "distr.admin.auth";

type AdminSession = {
  username: string;
  loggedInAt: string;
};

function readAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ADMIN_AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  }
}

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession | null>(() => readAdminSession());

  useEffect(() => {
    const onStorage = () => setSession(readAdminSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((username: string, _password: string) => {
    const next: AdminSession = {
      username: username.trim() || "admin",
      loggedInAt: new Date().toISOString(),
    };
    window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next));
    setSession(next);
    return true;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    setSession(null);
  }, []);

  return {
    session,
    isAuthenticated: Boolean(session),
    login,
    logout,
  };
}
