import { A as API } from "./router-cZ9I3NNJ.js";
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
async function fetchBranches(skip, limit) {
  const params = new URLSearchParams();
  params.set("skip", String(skip));
  params.set("limit", String(limit));
  const qs = params.toString();
  return adminFetch(qs ? `${API.branches}?${qs}` : API.branches);
}
async function createBranch(data) {
  return adminFetch(API.branches, {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function updateBranch(branchId, data) {
  return adminFetch(API.branchById(branchId), {
    method: "PUT",
    body: JSON.stringify(data)
  });
}
async function deleteBranch(branchId) {
  return adminFetch(API.branchById(branchId), { method: "DELETE" });
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
  VENDOR_AGENT: "Agent Vansel",
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
export {
  fetchSecurityKeys as A,
  fetchSystemMonitor as B,
  fetchUserLocationHistory as C,
  fetchUsers as D,
  fetchWorkingSessions as E,
  getAdminToken as F,
  getUserFullName as G,
  getUserStatusLabel as H,
  getUserTypeLabel as I,
  importDatabase as J,
  logoutApi as K,
  markNotificationRead as L,
  markNotificationsReadMultiple as M,
  sendAiQuery as N,
  updateApp as O,
  updateBranch as P,
  updateCompany as Q,
  updateSecurityKey as R,
  updateUser as S,
  updateVersion as T,
  USER_TYPE_LABELS as U,
  createApp as a,
  createBranch as b,
  createAlembicVersion as c,
  createCompany as d,
  createNotification as e,
  createSecurityKey as f,
  createUser as g,
  createVersion as h,
  deleteAlembicVersion as i,
  deleteApp as j,
  deleteBranch as k,
  deleteCompany as l,
  deleteNotification as m,
  deleteSecurityKey as n,
  deleteUser as o,
  deleteVersion as p,
  exportDatabase as q,
  fetchActivity as r,
  fetchAlembicVersions as s,
  fetchAppVersions as t,
  fetchApps as u,
  fetchBranches as v,
  fetchCompanies as w,
  fetchDatabaseInfo as x,
  fetchNotifications as y,
  fetchProfile as z
};
