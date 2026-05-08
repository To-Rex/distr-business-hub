import { API } from "./api";

export type ApiUserType =
  | "SUPERADMIN"
  | "ADMIN"
  | "CEO"
  | "MANAGER"
  | "USER"
  | "AGENT"
  | "DELIVERER";
export type ApiUserStatus = "ACTIVE" | "BLOCKED";

export type ApiCompany = {
  id: number;
  name: string;
  inn: string;
  base_url: string;
  asl_belgi_token: string;
};

export type ApiSecurityKey = {
  id: number;
  key: string;
  company_id: number;
};

export type ApiUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  photo: string | null;
  user_type: ApiUserType;
  company_id: number | null;
  company_rel: ApiCompany | null;
  manager: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    photo: string | null;
    user_type: string;
    company_rel: ApiCompany | null;
    created_at: string;
  } | null;
  manager_id: number | null;
  user_1c_id: number | null;
  user_1c_login: string | null;
  user_1c_password: string | null;
  created_at: string;
  user_status: ApiUserStatus;
};

export type ApiNotification = {
  id: number;
  company_id: number;
  user_1c_id: number;
  created_at: string;
  title: string;
  message: string;
  status: {
    id: number;
    is_read: boolean;
    read_at: string | null;
  } | null;
  author: string;
};

export type ApiApp = {
  id: number;
  name: string;
  tag: string;
  created_at: string;
};

export type ApiAppVersion = {
  id: number;
  version: string;
  build_number: number;
  force_update: boolean;
  update_url: string;
  message: string;
  title: string;
  app_id: number;
  created_at: string;
};

export type ApiDevice = {
  id: number;
  name: string;
  device_uuid: string;
  platform: string | null;
  model: string | null;
  os_version: string | null;
  app_version: string | null;
  is_active: boolean;
  last_seen: string | null;
  user_id: number;
  created_at: string;
};

export type ApiWorkingSession = {
  id: number;
  session: string;
  device_name: string;
  app: string;
  is_testing: boolean;
  created_at: string;
};

const MAIN_AUTH_KEY = "distr.admin.auth";

type StoredSession = {
  access_token: string;
  expires_in: string;
  user_id: number;
};

export function getAdminToken(): string | null {
  try {
    const raw = localStorage.getItem(MAIN_AUTH_KEY);
    if (!raw) return null;
    const session: StoredSession = JSON.parse(raw);
    return session.access_token || null;
  } catch {
    return null;
  }
}

async function adminFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (options?.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...((options?.headers as Record<string, string>) || {}) },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `API Error: ${res.status}`);
  }

  if (res.status === 204) return null as unknown as T;
  return res.json();
}

export async function fetchUsers(userType?: string): Promise<ApiUser[]> {
  const url = userType ? `${API.userManager}?user_type=${userType}` : API.userManager;
  return adminFetch<ApiUser[]>(url);
}

export async function fetchUser(userId: number): Promise<ApiUser> {
  return adminFetch<ApiUser>(API.userManagerById(userId));
}

export type CreateUserPayload = {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  photo?: string;
};

export async function createUser(data: CreateUserPayload): Promise<ApiUser> {
  return adminFetch<ApiUser>(API.userManagerCreate, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export type UpdateUserPayload = {
  username?: string;
  password?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  photo?: string;
  user_type?: ApiUserType;
  user_status?: ApiUserStatus;
  company_id?: number;
  manager_id?: number;
};

export async function updateUser(userId: number, data: UpdateUserPayload): Promise<ApiUser> {
  return adminFetch<ApiUser>(API.userManagerById(userId), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(userId: number): Promise<void> {
  return adminFetch<void>(API.userManagerById(userId), { method: "DELETE" });
}

export async function fetchCompanies(skip?: number, limit?: number): Promise<ApiCompany[]> {
  const params = new URLSearchParams();
  if (skip !== undefined) params.set("skip", String(skip));
  if (limit !== undefined) params.set("limit", String(limit));
  const qs = params.toString();
  return adminFetch<ApiCompany[]>(qs ? `${API.companies}?${qs}` : API.companies);
}

export async function fetchCompany(companyId: number): Promise<ApiCompany> {
  return adminFetch<ApiCompany>(API.companyById(companyId));
}

export type CreateCompanyPayload = {
  name: string;
  inn?: string;
  base_url?: string;
  asl_belgi_token?: string;
};

export async function createCompany(data: CreateCompanyPayload): Promise<ApiCompany> {
  return adminFetch<ApiCompany>(API.companies, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export type UpdateCompanyPayload = {
  name?: string;
  inn?: string;
  base_url?: string;
  asl_belgi_token?: string;
};

export async function updateCompany(
  companyId: number,
  data: UpdateCompanyPayload,
): Promise<ApiCompany> {
  return adminFetch<ApiCompany>(API.companyById(companyId), {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCompany(companyId: number): Promise<void> {
  return adminFetch<void>(API.companyById(companyId), { method: "DELETE" });
}

export async function fetchSecurityKeys(companyId: number): Promise<ApiSecurityKey[]> {
  return adminFetch<ApiSecurityKey[]>(API.companySecurityKeys(companyId));
}

export type CreateSecurityKeyPayload = {
  key: string;
  company_id: number;
};

export async function createSecurityKey(
  companyId: number,
  data: CreateSecurityKeyPayload,
): Promise<ApiSecurityKey> {
  return adminFetch<ApiSecurityKey>(API.companySecurityKeys(companyId), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSecurityKey(
  keyId: number,
  data: { key?: string },
): Promise<ApiSecurityKey> {
  return adminFetch<ApiSecurityKey>(API.securityKeyById(keyId), {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSecurityKey(keyId: number): Promise<void> {
  return adminFetch<void>(API.securityKeyById(keyId), { method: "DELETE" });
}

export async function fetchNotifications(
  companyId?: number,
  user1cId?: number,
): Promise<ApiNotification[]> {
  const params = new URLSearchParams();
  if (companyId !== undefined) params.set("company_id", String(companyId));
  if (user1cId !== undefined) params.set("user_1c_id", String(user1cId));
  const qs = params.toString();
  return adminFetch<ApiNotification[]>(qs ? `${API.notifications}?${qs}` : API.notifications);
}

export type CreateNotificationPayload = {
  title: string;
  message?: string;
  date?: string;
  author?: string;
  user_type?: string;
  user_1c_id?: number;
  company_id?: number;
  security_key?: string;
};

export async function createNotification(
  data: CreateNotificationPayload,
): Promise<ApiNotification> {
  return adminFetch<ApiNotification>(API.notificationsCreate, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchNotificationById(notificationId: number): Promise<ApiNotification> {
  return adminFetch<ApiNotification>(API.notificationById(notificationId));
}

export async function deleteNotification(notificationId: number): Promise<void> {
  return adminFetch<void>(API.notificationById(notificationId), { method: "DELETE" });
}

export async function markNotificationRead(notificationId: number): Promise<{
  id: number;
  is_read: boolean;
  read_at: string;
  notification_id: number;
  user_id: number;
}> {
  return adminFetch(API.notificationRead(notificationId), { method: "POST" });
}

export async function markNotificationsReadMultiple(ids: number[]): Promise<{ message: string }> {
  return adminFetch(API.notificationsReadMultiple, {
    method: "POST",
    body: JSON.stringify(ids),
  });
}

export async function fetchUnreadCount(): Promise<{ unread_count: number }> {
  return adminFetch(API.notificationsUnreadCount);
}

export async function fetchApps(): Promise<ApiApp[]> {
  return adminFetch<ApiApp[]>(API.apps);
}

export async function fetchApp(appId: number): Promise<ApiApp> {
  return adminFetch<ApiApp>(API.appById(appId));
}

export type CreateAppPayload = {
  name: string;
  tag: string;
};

export async function createApp(data: CreateAppPayload): Promise<ApiApp> {
  return adminFetch<ApiApp>(API.apps, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateApp(appId: number, data: { name?: string }): Promise<ApiApp> {
  return adminFetch<ApiApp>(API.appById(appId), {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteApp(appId: number): Promise<void> {
  return adminFetch<void>(API.appById(appId), { method: "DELETE" });
}

export async function fetchAppVersions(appId: number): Promise<ApiAppVersion[]> {
  return adminFetch<ApiAppVersion[]>(API.appVersions(appId));
}

export type CreateVersionPayload = {
  version: string;
  build_number: number;
  force_update: boolean;
  update_url?: string;
  message?: string;
  title?: string;
  app_id: number;
};

export async function createVersion(
  appId: number,
  data: CreateVersionPayload,
): Promise<ApiAppVersion> {
  return adminFetch<ApiAppVersion>(API.appVersions(appId), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateVersion(
  versionId: number,
  data: {
    version?: string;
    build_number: number;
    force_update: boolean;
    update_url?: string;
    message?: string;
    title?: string;
  },
): Promise<ApiAppVersion> {
  return adminFetch<ApiAppVersion>(API.versionById(versionId), {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteVersion(versionId: number): Promise<void> {
  return adminFetch<void>(API.versionById(versionId), { method: "DELETE" });
}

export async function fetchLatestVersion(appType: string): Promise<ApiAppVersion> {
  return adminFetch<ApiAppVersion>(API.latestVersion(appType));
}

export async function uploadApk(
  file: File,
): Promise<{ filename: string; url: string; size: number }> {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(API.uploadApk, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed: ${res.status}`);
  }

  return res.json();
}

export async function fetchDevices(params?: {
  is_active?: boolean;
  user_id?: number;
  skip?: number;
  limit?: number;
}): Promise<ApiDevice[]> {
  const searchParams = new URLSearchParams();
  if (params?.is_active !== undefined) searchParams.set("is_active", String(params.is_active));
  if (params?.user_id !== undefined) searchParams.set("user_id", String(params.user_id));
  if (params?.skip !== undefined) searchParams.set("skip", String(params.skip));
  if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return adminFetch<ApiDevice[]>(qs ? `${API.devices}?${qs}` : API.devices);
}

export async function fetchWorkingSessions(): Promise<ApiWorkingSession[]> {
  return adminFetch<ApiWorkingSession[]>(API.workingSessions);
}

export const USER_TYPE_LABELS: Record<ApiUserType, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  CEO: "CEO",
  MANAGER: "Manager",
  USER: "User",
  AGENT: "Agent",
  DELIVERER: "Deliverer",
};

export const USER_STATUS_LABELS: Record<ApiUserStatus, string> = {
  ACTIVE: "Faol",
  BLOCKED: "Blokirovka",
};

export function getUserTypeLabel(type: ApiUserType): string {
  return USER_TYPE_LABELS[type] || type;
}

export function getUserStatusLabel(status: ApiUserStatus): string {
  return USER_STATUS_LABELS[status] || status;
}

export function getUserFullName(user: ApiUser): string {
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username;
}

export async function fetchProfile(): Promise<ApiUser> {
  return adminFetch<ApiUser>(API.profile);
}

export async function logoutApi(): Promise<void> {
  try {
    await adminFetch<void>(API.logout, { method: "GET" });
  } catch {}
}
