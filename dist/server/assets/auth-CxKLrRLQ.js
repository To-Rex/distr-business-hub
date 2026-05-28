import { useState, useEffect, useCallback } from "react";
import { A as API } from "./router-CLlTYvOR.js";
const MAIN_AUTH_KEY = "distr.admin.auth";
function getAdminToken() {
  try {
    const raw = localStorage.getItem(MAIN_AUTH_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session.access_token || null;
  } catch {
    return null;
  }
}
async function refreshAdminToken() {
  try {
    const raw = localStorage.getItem(MAIN_AUTH_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session.refresh_token) return null;
    const res = await fetch(API.refreshToken, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    });
    if (!res.ok) {
      localStorage.removeItem(MAIN_AUTH_KEY);
      return null;
    }
    const data = await res.json();
    const updated = {
      ...session,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in
    };
    localStorage.setItem(MAIN_AUTH_KEY, JSON.stringify(updated));
    return data.access_token;
  } catch {
    return null;
  }
}
async function adminFetch(url, options) {
  const doFetch = async (token2) => {
    const headers = {
      Accept: "application/json",
      ...token2 ? { Authorization: `Bearer ${token2}` } : {}
    };
    if (options?.body && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    return fetch(url, {
      ...options,
      headers: { ...headers, ...options?.headers || {} }
    });
  };
  let token = getAdminToken();
  let res = await doFetch(token);
  if (res.status === 401) {
    const newToken = await refreshAdminToken();
    if (newToken) {
      token = newToken;
      res = await doFetch(token);
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `API Error: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}
async function fetchUsers(userType) {
  const url = API.userManager;
  return adminFetch(url);
}
async function createUser(data) {
  return adminFetch(API.userManagerCreate, {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function updateUser(userId, data) {
  return adminFetch(API.userManagerById(userId), {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}
async function deleteUser(userId) {
  return adminFetch(API.userManagerById(userId), { method: "DELETE" });
}
async function fetchCompanies(skip, limit) {
  const params = new URLSearchParams();
  const qs = params.toString();
  return adminFetch(qs ? `${API.companies}?${qs}` : API.companies);
}
async function fetchActivity(lang) {
  const res = await adminFetch(API.activity(lang));
  return res.data;
}
async function createCompany(data) {
  return adminFetch(API.companies, {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function updateCompany(companyId, data) {
  return adminFetch(API.companyById(companyId), {
    method: "PUT",
    body: JSON.stringify(data)
  });
}
async function deleteCompany(companyId) {
  return adminFetch(API.companyById(companyId), { method: "DELETE" });
}
async function fetchSecurityKeys(companyId) {
  return adminFetch(API.companySecurityKeys(companyId));
}
async function createSecurityKey(companyId, data) {
  return adminFetch(API.companySecurityKeys(companyId), {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function updateSecurityKey(keyId, data) {
  return adminFetch(API.securityKeyById(keyId), {
    method: "PUT",
    body: JSON.stringify(data)
  });
}
async function deleteSecurityKey(keyId) {
  return adminFetch(API.securityKeyById(keyId), { method: "DELETE" });
}
async function fetchNotifications(companyId, user1cId) {
  const params = new URLSearchParams();
  if (companyId !== void 0) params.set("company_id", String(companyId));
  const qs = params.toString();
  return adminFetch(qs ? `${API.notifications}?${qs}` : API.notifications);
}
async function createNotification(data) {
  return adminFetch(API.notificationsCreate, {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function deleteNotification(notificationId) {
  return adminFetch(API.notificationById(notificationId), { method: "DELETE" });
}
async function markNotificationRead(notificationId) {
  return adminFetch(API.notificationRead(notificationId), { method: "POST" });
}
async function markNotificationsReadMultiple(ids) {
  return adminFetch(API.notificationsReadMultiple, {
    method: "POST",
    body: JSON.stringify(ids)
  });
}
async function fetchApps() {
  return adminFetch(API.apps);
}
async function createApp(data) {
  return adminFetch(API.apps, {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function updateApp(appId, data) {
  return adminFetch(API.appById(appId), {
    method: "PUT",
    body: JSON.stringify(data)
  });
}
async function deleteApp(appId) {
  return adminFetch(API.appById(appId), { method: "DELETE" });
}
async function fetchAppVersions(appId) {
  return adminFetch(API.appVersions(appId));
}
async function createVersion(appId, data) {
  return adminFetch(API.appVersions(appId), {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function updateVersion(versionId, data) {
  return adminFetch(API.versionById(versionId), {
    method: "PUT",
    body: JSON.stringify(data)
  });
}
async function deleteVersion(versionId) {
  return adminFetch(API.versionById(versionId), { method: "DELETE" });
}
async function fetchWorkingSessions() {
  return adminFetch(API.workingSessions);
}
const USER_TYPE_LABELS = {
  USER: "Foydalanuvchi",
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Menejer",
  SUPERVISOR: "Supervizor",
  AGENT: "Agent",
  DELIVERER: "Yetkazib beruvchi",
  VENDOR_AGENT: "Vendor Agent",
  CLIENT: "Klient",
  DEALER: "Dealer",
  FACTORY: "Fabrika",
  CEO: "Bosh direktor",
  FINANCIST: "Buhgalter",
  WAREHOUSE: "Ombor",
  SALESMAN: "Sotuvchi",
  CASHIER: "Kassir",
  HR: "HR",
  MARKETING: "Marketing",
  EXTERNAL_SELLER: "Tashqi sotuvchi",
  MERCHANDISER: "Merchandiser"
};
const USER_STATUS_LABELS = {
  ACTIVE: "Faol",
  INACTIVE: "Faol emas",
  PENDING: "Kutilmoqda",
  BLOCKED: "Block"
};
function getUserTypeLabel(type) {
  return USER_TYPE_LABELS[type] || type;
}
function getUserStatusLabel(status) {
  return USER_STATUS_LABELS[status] || status;
}
function getUserFullName(user) {
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username;
}
async function fetchProfile() {
  return adminFetch(API.profile);
}
async function logoutApi() {
  try {
    await adminFetch(API.logout, { method: "GET" });
  } catch (error) {
    console.error(error);
  }
}
async function fetchSystemMonitor() {
  return adminFetch(API.systemMonitor);
}
async function fetchAlembicVersions() {
  return adminFetch(API.alembicVersionList);
}
async function deleteAlembicVersion(versionNum) {
  return adminFetch(API.alembicVersionDelete(versionNum), { method: "DELETE" });
}
async function createAlembicVersion(data) {
  return adminFetch(API.alembicVersionCreate, {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function fetchUserLocationHistory(userId) {
  return adminFetch(API.userHistory(userId));
}
async function sendAiQuery(payload) {
  return adminFetch(API.aiQuery, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function fetchDatabaseInfo() {
  return adminFetch(API.databaseInfo);
}
async function importDatabase(file) {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append("file", file);
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(API.databaseImport, {
    method: "POST",
    headers,
    body: formData
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Import failed: ${res.status}`);
  }
  return res.json();
}
async function exportDatabase() {
  const token = getAdminToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(API.databaseExport, {
    method: "GET",
    headers
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Export failed: ${res.status}`);
  }
  return res.blob();
}
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
  useEffect(() => {
    const onStorage = () => setSession(readAdminSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    if (!session?.access_token) return;
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
    });
  }, [session?.access_token]);
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(API.login, {
        method: "POST",
        headers: { accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, device_id: "admin-panel" })
      });
      if (!res.ok) {
        return false;
      }
      const data = await res.json();
      const next = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        user_id: data.user_id
      };
      window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next));
      setSession(next);
      return true;
    } catch {
      return false;
    }
  }, []);
  const refreshToken = useCallback(async () => {
    try {
      const raw = localStorage.getItem(ADMIN_AUTH_KEY);
      if (!raw) return false;
      const current = JSON.parse(raw);
      if (!current.refresh_token) return false;
      const res = await fetch(API.refreshToken, {
        method: "POST",
        headers: { accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: current.refresh_token })
      });
      if (!res.ok) {
        localStorage.removeItem(ADMIN_AUTH_KEY);
        setSession(null);
        return false;
      }
      const data = await res.json();
      const next = {
        ...current,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in
      };
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next));
      setSession(next);
      return true;
    } catch {
      return false;
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
    login,
    refreshToken,
    logout
  };
}
export {
  fetchUsers as A,
  fetchWorkingSessions as B,
  getAdminToken as C,
  getUserFullName as D,
  getUserStatusLabel as E,
  getUserTypeLabel as F,
  importDatabase as G,
  markNotificationRead as H,
  markNotificationsReadMultiple as I,
  sendAiQuery as J,
  updateApp as K,
  updateCompany as L,
  updateSecurityKey as M,
  updateUser as N,
  updateVersion as O,
  useAdminAuth as P,
  createApp as a,
  createCompany as b,
  createAlembicVersion as c,
  createNotification as d,
  createSecurityKey as e,
  createUser as f,
  createVersion as g,
  deleteAlembicVersion as h,
  deleteApp as i,
  deleteCompany as j,
  deleteNotification as k,
  deleteSecurityKey as l,
  deleteUser as m,
  deleteVersion as n,
  exportDatabase as o,
  fetchActivity as p,
  fetchAlembicVersions as q,
  fetchAppVersions as r,
  fetchApps as s,
  fetchCompanies as t,
  fetchDatabaseInfo as u,
  fetchNotifications as v,
  fetchProfile as w,
  fetchSecurityKeys as x,
  fetchSystemMonitor as y,
  fetchUserLocationHistory as z
};
