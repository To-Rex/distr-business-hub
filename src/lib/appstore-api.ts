import { getAdminToken } from "./admin-api";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const BACKEND_HOST = API_BASE.replace(/\/api$/, "");
const APPSTORE_BASE = BACKEND_HOST + "/appstore";

export function getAppStoreAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return BACKEND_HOST + (path.startsWith("/") ? path : "/" + path);
}

export type AppStoreApp = {
  id: string;
  name: string;
  icon: string;
  developer: string;
  shortDescription: string;
  category: string;
  tags: string[];
  totalDownloads: number;
  latestVersion: string;
  hasApk: boolean;
  updatedAt: string;
  createdAt: string;
  published: boolean;
};

export type AppStoreAppVersion = {
  version: string;
  releaseDate: string;
  fileSize: number;
  minAndroid: string;
  changelog: string;
  downloadUrl: string;
  downloadCount: number;
  isLatest: boolean;
  hasApk: boolean;
};

export type AppStoreUser = {
  id: string;
  username: string;
  displayName: string;
  role: string;
};

export type AppStoreCategory = {
  id: string;
  name: string;
  labelUz: string;
  appCount: number;
};

export type AppStoreAppDetail = AppStoreApp & {
  description: string;
  screenshots: string[];
  versions: AppStoreAppVersion[];
  createdBy: string;
};

type AppStoreResponse<T> = {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function appstoreFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (options?.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...((options?.headers as Record<string, string>) || {}) },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `AppStore API Error: ${res.status}`);
  }

  if (res.status === 204) return null as unknown as T;
  return res.json();
}

export async function fetchAppStoreApps(): Promise<AppStoreApp[]> {
  const res = await appstoreFetch<AppStoreResponse<any>>(
    `${APPSTORE_BASE}/admin/apps`,
  );
  return (res.data || []).map((app: any) => {
    const latest = app.versions?.find((v: any) => v.isLatest)?.version || app.versions?.[0]?.version || "";
    return { ...app, latestVersion: latest };
  });
}

export async function fetchAppStoreUsers(): Promise<AppStoreUser[]> {
  const res = await appstoreFetch<AppStoreResponse<AppStoreUser[]>>(
    `${APPSTORE_BASE}/admin/users`,
  );
  return res.data;
}

export async function fetchAppStoreCategories(): Promise<AppStoreCategory[]> {
  const res = await appstoreFetch<AppStoreResponse<AppStoreCategory[]>>(
    `${APPSTORE_BASE}/categories`,
  );
  return res.data;
}

export async function fetchAppStoreApp(id: string): Promise<AppStoreAppDetail> {
  const res = await appstoreFetch<AppStoreResponse<AppStoreAppDetail>>(
    `${APPSTORE_BASE}/admin/apps/${id}`,
  );
  return res.data;
}

export async function createAppStoreApp(data: FormData): Promise<AppStoreApp> {
  const res = await appstoreFetch<AppStoreResponse<AppStoreApp>>(
    `${APPSTORE_BASE}/admin/apps`,
    { method: "POST", body: data },
  );
  return res.data;
}

export async function updateAppStoreApp(id: string, data: FormData): Promise<AppStoreApp> {
  const res = await appstoreFetch<AppStoreResponse<AppStoreApp>>(
    `${APPSTORE_BASE}/admin/apps/${id}`,
    { method: "PUT", body: data },
  );
  return res.data;
}

export async function deleteAppStoreApp(id: string): Promise<void> {
  await appstoreFetch<void>(
    `${APPSTORE_BASE}/admin/apps/${id}`,
    { method: "DELETE" },
  );
}

export async function toggleAppStoreAppPublish(id: string): Promise<void> {
  await appstoreFetch<void>(
    `${APPSTORE_BASE}/admin/apps/${id}/toggle-publish`,
    { method: "PATCH" },
  );
}

export async function fetchAppStoreAppVersions(appId: string): Promise<AppStoreAppVersion[]> {
  const res = await appstoreFetch<AppStoreResponse<AppStoreAppVersion[]>>(
    `${APPSTORE_BASE}/admin/apps/${appId}/versions?limit=100`,
  );
  return res.data;
}

export async function createAppStoreAppVersion(appId: string, data: FormData): Promise<void> {
  await appstoreFetch<void>(
    `${APPSTORE_BASE}/admin/apps/${appId}/versions`,
    { method: "POST", body: data },
  );
}

export async function updateAppStoreAppVersion(appId: string, version: string, data: FormData): Promise<void> {
  await appstoreFetch<void>(
    `${APPSTORE_BASE}/admin/apps/${appId}/versions/${version}`,
    { method: "PUT", body: data },
  );
}

export async function deleteAppStoreAppVersion(appId: string, version: string): Promise<void> {
  await appstoreFetch<void>(
    `${APPSTORE_BASE}/admin/apps/${appId}/versions/${version}`,
    { method: "DELETE" },
  );
}

export async function uploadAppStoreAppScreenshots(appId: string, files: File[]): Promise<void> {
  const fd = new FormData();
  for (const f of files) {
    fd.append("screenshots", f);
  }
  await appstoreFetch<void>(
    `${APPSTORE_BASE}/admin/apps/${appId}/screenshots`,
    { method: "POST", body: fd },
  );
}

export async function deleteAppStoreAppScreenshot(appId: string, index: number): Promise<void> {
  await appstoreFetch<void>(
    `${APPSTORE_BASE}/admin/apps/${appId}/screenshots/${index}`,
    { method: "DELETE" },
  );
}

export async function clearAppStoreData(): Promise<void> {
  await appstoreFetch<void>(
    `${APPSTORE_BASE}/admin/data/clear`,
    { method: "POST" },
  );
}

type ExportResponse = {
  message: string;
  download_url: string;
  filename: string;
};

export async function exportAppStoreData(): Promise<ExportResponse> {
  const res = await appstoreFetch<AppStoreResponse<ExportResponse>>(
    `${APPSTORE_BASE}/admin/data/export`,
  );
  return res.data;
}

export async function importAppStoreData(file: File): Promise<void> {
  const fd = new FormData();
  fd.append("file", file);
  await appstoreFetch<void>(
    `${APPSTORE_BASE}/admin/data/import`,
    { method: "POST", body: fd },
  );
}
