import { useState, useEffect, useCallback } from "react";
import { A as API } from "./router-CTVAwSR8.js";
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
async function adminFetch(url, options) {
  const token = getAdminToken();
  const headers = {
    Accept: "application/json",
    ...token ? { Authorization: `Bearer ${token}` } : {}
  };
  if (options?.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options?.headers || {} }
  });
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
async function fetchDatabaseInfo() {
  return adminFetch(API.databaseInfo);
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
    logout
  };
}
export {
  fetchAppVersions as A,
  createApp as B,
  updateApp as C,
  deleteApp as D,
  createVersion as E,
  updateVersion as F,
  deleteVersion as G,
  fetchSystemMonitor as H,
  fetchActivity as I,
  createCompany as J,
  updateCompany as K,
  deleteCompany as L,
  fetchWorkingSessions as a,
  fetchCompanies as b,
  getUserStatusLabel as c,
  getUserTypeLabel as d,
  fetchUserLocationHistory as e,
  fetchUsers as f,
  getUserFullName as g,
  deleteUser as h,
  createUser as i,
  updateUser as j,
  fetchDatabaseInfo as k,
  fetchSecurityKeys as l,
  fetchAlembicVersions as m,
  createAlembicVersion as n,
  deleteAlembicVersion as o,
  createSecurityKey as p,
  deleteSecurityKey as q,
  updateSecurityKey as r,
  getAdminToken as s,
  fetchNotifications as t,
  useAdminAuth as u,
  createNotification as v,
  deleteNotification as w,
  markNotificationRead as x,
  markNotificationsReadMultiple as y,
  fetchApps as z
};
