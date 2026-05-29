import { useCallback, useEffect, useState } from "react";
import { API } from "@/lib/api";
import { fetchProfile, logoutApi } from "@/lib/admin-api";

const ADMIN_AUTH_KEY = "distr.admin.auth";

type StoredSession = {
  access_token: string;
  expires_in: string;
  user_id: number;
  username?: string;
  user_type?: string;
};

function readAdminSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ADMIN_AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  }
}

export function useAdminAuth() {
  const [session, setSession] = useState<StoredSession | null>(() => readAdminSession());
  const [profileLoading, setProfileLoading] = useState(() => {
    const s = readAdminSession();
    return !!s?.access_token && !s?.user_type;
  });

  useEffect(() => {
    const onStorage = () => setSession(readAdminSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!session?.access_token) {
      setProfileLoading(false);
      return;
    }
    if (session.user_type) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    fetchProfile()
      .then((profile) => {
        setSession((prev) => {
          if (!prev) return prev;
          const next = {
            ...prev,
            username: profile.username || profile.email || "admin",
            user_type: profile.user_type,
          };
          window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [session?.access_token, session?.user_type]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(API.login, {
        method: "POST",
        headers: { accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, device_id: "admin-panel" }),
      });

      if (!res.ok) {
        return { ok: false as const, reason: "credentials" as const };
      }

      const data = await res.json();
      const next: StoredSession = {
        access_token: data.access_token,
        expires_in: data.expires_in,
        user_id: data.user_id,
      };
      window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next));
      setSession(next);
      return { ok: true as const };
    } catch {
      return { ok: false as const, reason: "credentials" as const };
    }
  }, []);

  const logout = useCallback(async () => {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    setSession(null);
    try {
      await logoutApi();
    } catch {}
  }, []);

  return {
    session,
    isAuthenticated: Boolean(session),
    profileLoading,
    login,
    logout,
  };
}
