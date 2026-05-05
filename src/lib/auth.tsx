import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type CompanyRel = {
  id: number;
  name: string;
  inn: string;
  base_url: string;
  asl_belgi_token: string;
};

type ManagerProfile = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  photo: string | null;
  user_type: string;
  company_rel: CompanyRel;
  created_at: string;
};

type User = {
  email: string;
  name: string;
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  photo: string | null;
  user_type: string;
  company_id: number;
  company_rel: CompanyRel;
  manager: ManagerProfile | null;
  manager_id: number | null;
  user_1c_id: number | null;
  user_1c_login: string;
  user_1c_password: string;
  created_at: string;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  accessToken: string | null;
};

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "distr.auth";

import { API } from "./api";

type LoginResponse = {
  id: number;
  access_token: string;
  expires_in: string;
  user_id: number;
  created_at: string;
  updated_at: string | null;
};

type ProfileResponse = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  photo: string | null;
  user_type: string;
  company_id: number;
  company_rel: CompanyRel;
  manager: ManagerProfile | null;
  manager_id: number | null;
  user_1c_id: number;
  user_1c_login: string;
  user_1c_password: string;
  created_at: string;
};

type StoredSession = {
  user: User;
  access_token: string;
  expires_in: string;
  user_id: number;
};

function profileToUser(p: ProfileResponse): User {
  return {
    ...p,
    name: `${p.first_name} ${p.last_name}`.trim() || p.username,
  };
}

async function fetchProfile(token: string): Promise<User> {
    const res = await fetch(API.profile, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  const data: ProfileResponse = await res.json();
  return profileToUser(data);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") { setLoading(false); return; }
    const raw = window.localStorage.getItem(KEY);
    if (!raw) { setLoading(false); return; }
    try {
      const session: StoredSession = JSON.parse(raw);
      if (!session.access_token || new Date(session.expires_in) <= new Date()) {
        window.localStorage.removeItem(KEY);
        setLoading(false);
        return;
      }
      setAccessToken(session.access_token);
      if (session.user?.id) {
        setUser(session.user);
        setLoading(false);
      }
      fetchProfile(session.access_token)
        .then((u) => {
          const updated: StoredSession = { ...session, user: u };
          window.localStorage.setItem(KEY, JSON.stringify(updated));
          setUser(u);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } catch {
      window.localStorage.removeItem(KEY);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(API.login, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, device_id: "web", firebase_token: "" }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Login failed (${res.status})`);
    }

    const data: LoginResponse = await res.json();
    setAccessToken(data.access_token);

    const u = await fetchProfile(data.access_token);
    const session: StoredSession = {
      user: u,
      access_token: data.access_token,
      expires_in: data.expires_in,
      user_id: data.user_id,
    };
    window.localStorage.setItem(KEY, JSON.stringify(session));
    setUser(u);
  };

  const logout = () => {
    window.localStorage.removeItem(KEY);
    setUser(null);
    setAccessToken(null);
  };

  return <Ctx.Provider value={{ user, login, logout, accessToken, loading }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
