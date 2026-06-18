import { useState, useEffect, useCallback } from "react";
import { A as API } from "./router-CHkxHBR7.js";
import { z as fetchProfile, K as logoutApi } from "./admin-api-CS6ZGJ5E.js";
const ADMIN_AUTH_KEY = "distr.admin.auth";
function readAdminSession() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ADMIN_AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  }
}
function useAdminAuth() {
  const [session, setSession] = useState(() => readAdminSession());
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
    fetchProfile().then((profile) => {
      setSession((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          username: profile.username || profile.email || "admin",
          user_type: profile.user_type
        };
        window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next));
        return next;
      });
    }).catch(() => {
    }).finally(() => setProfileLoading(false));
  }, [session?.access_token, session?.user_type]);
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(API.login, {
        method: "POST",
        headers: { accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, device_id: "admin-panel" })
      });
      if (!res.ok) {
        return { ok: false, reason: "credentials" };
      }
      const data = await res.json();
      const next = {
        access_token: data.access_token,
        expires_in: data.expires_in,
        user_id: data.user_id
      };
      window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next));
      setSession(next);
      return { ok: true };
    } catch {
      return { ok: false, reason: "credentials" };
    }
  }, []);
  const logout = useCallback(async () => {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    setSession(null);
    try {
      await logoutApi();
    } catch {
    }
  }, []);
  return {
    session,
    isAuthenticated: Boolean(session),
    profileLoading,
    login,
    logout
  };
}
export {
  useAdminAuth as u
};
