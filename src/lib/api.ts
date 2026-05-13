const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
//const BASE_URL = "https://distr.mxsoft.uz/api";

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const WS_BASE = BASE_URL.replace(/^https?/, "wss");
const proxied1C = (baseUrl: string, path: string) =>
  `/proxy-1c?target=${encodeURIComponent(baseUrl)}&path=${encodeURIComponent(path)}`;

type ApiEndpoints = {
  login: string;
  profile: string;
  logout: string;
  wsLocations: (token: string) => string;
  userHistory: (userId: number) => string;
  workingSession: (userId: number, role?: string) => string;
  clientLocations: (baseUrl: string) => string;
  clientInfo: (baseUrl: string, clientId: number) => string;
  clientVisitData: (baseUrl: string, clientId: number) => string;
  clientsByGroup: (baseUrl: string) => string;
  productsByGroup: (baseUrl: string) => string;
  employees: (baseUrl: string) => string;
  userManager: string;
  userManagerStatus: (userId: number) => string;
  salesByCategory: (
    baseUrl: string,
    branchId: number,
    dateBegin: string,
    dateEnd: string,
  ) => string;
  reportByClient: (baseUrl: string, branchId: number, dateBegin: string, dateEnd: string) => string;
  financeOrders: (baseUrl: string, dateBegin: string, dateEnd: string) => string;
  ordersAll: (baseUrl: string, dateBegin: string, dateEnd: string) => string;
  companyById: (id: number) => string;
  companies: string;
  companySecurityKeys: (id: number) => string;
  securityKeyById: (id: number) => string;
  notifications: string;
  notificationsCreate: string;
  notificationById: (id: number) => string;
  notificationRead: (id: number) => string;
  notificationsReadMultiple: string;
  notificationsUnreadCount: string;
  apps: string;
  appById: (id: number) => string;
  appVersions: (id: number) => string;
  versionById: (id: number) => string;
  latestVersion: (appType: string) => string;
  uploadApk: string;
  devices: string;
  workingSessions: string;
  workingSessionsByUser: (userId: number) => string;
  userManagerCreate: string;
  userManagerById: (id: number) => string;
  systemMonitor: string;
  alembicVersionList: string;
  alembicVersionCreate: string;
  alembicVersionDelete: (versionNum: string) => string;
  activity: (lang: string) => string;
};

export const API: ApiEndpoints = {
  login: `${BASE_URL}/v1/authentication/login`,
  logout: `${BASE_URL}/v1/authentication/logout`,
  profile: `${BASE_URL}/v1/authentication/profile`,
  wsLocations: (token: string) => `${WS_BASE}/v1/locations/ws/admvs?token=${token}`,
  userHistory: (userId: number) => `${BASE_URL}/v1/locations/user-history/${userId}`,
  workingSession: (userId: number, role?: string) => {
    const appRole = role
      ? role.toLowerCase() === "deliverer"
        ? "delivery"
        : role.toLowerCase()
      : "agent";
    return `${BASE_URL}/v1/working-sessions/user/${userId}?app=mx-${appRole}&is_testing=false`;
  },
  clientLocations: (baseUrl: string) => proxied1C(baseUrl, "/hs/manager/api/get_location_all"),
  clientInfo: (baseUrl: string, clientId: number) =>
    proxied1C(baseUrl, `/hs/manager/api/get_client_info?client_id=${clientId}`),
  clientVisitData: (baseUrl: string, clientId: number) =>
    proxied1C(baseUrl, `/hs/manager/api/get_visit_data_by_client?client_id=${clientId}`),
  clientsByGroup: (baseUrl: string) => proxied1C(baseUrl, "/hs/manager/api/GetClientsbyGroup"),
  productsByGroup: (baseUrl: string) => proxied1C(baseUrl, "/hs/manager/api/Getproductsbygroup"),
  employees: (baseUrl: string) => proxied1C(baseUrl, "/hs/manager/api/get_employees"),
  userManager: `${BASE_URL}/v1/user-manager`,
  userManagerStatus: (userId: number) => `${BASE_URL}/v1/user-manager/${userId}`,
  salesByCategory: (baseUrl: string, branchId: number, dateBegin: string, dateEnd: string) =>
    proxied1C(
      baseUrl,
      `/hs/manager/api/get_sales_by_category?branch_id=${branchId}&date_begin=${dateBegin}&date_end=${dateEnd}`,
    ),
  reportByClient: (baseUrl: string, branchId: number, dateBegin: string, dateEnd: string) =>
    proxied1C(
      baseUrl,
      `/hs/manager/api/get_report_by_client?branch_id=${branchId}&date_begin=${dateBegin}&date_end=${dateEnd}`,
    ),
  financeOrders: (baseUrl: string, dateBegin: string, dateEnd: string) =>
    proxied1C(
      baseUrl,
      `/hs/manager/api/GetlistordersAll?date_begin=${dateBegin}&date_end=${dateEnd}`,
    ),
  ordersAll: (baseUrl: string, dateBegin: string, dateEnd: string) =>
    proxied1C(
      baseUrl,
      `/hs/manager/api/GetlistordersAll?date_begin=${dateBegin}&date_end=${dateEnd}`,
    ),
  companyById: (id: number) => `${BASE_URL}/v1/companies/${id}`,
  companies: `${BASE_URL}/v1/companies/`,
  companySecurityKeys: (id: number) => `${BASE_URL}/v1/companies/${id}/security-keys`,
  securityKeyById: (id: number) => `${BASE_URL}/v1/companies/security-keys/${id}`,
  notifications: `${BASE_URL}/v1/notifications`,
  notificationsCreate: `${BASE_URL}/v1/notifications/create`,
  notificationById: (id: number) => `${BASE_URL}/v1/notifications/${id}`,
  notificationRead: (id: number) => `${BASE_URL}/v1/notifications/${id}/read`,
  notificationsReadMultiple: `${BASE_URL}/v1/notifications/read-multiple`,
  notificationsUnreadCount: `${BASE_URL}/v1/notifications/unread-count`,
  apps: `${BASE_URL}/v1/apps/`,
  appById: (id: number) => `${BASE_URL}/v1/apps/${id}`,
  appVersions: (id: number) => `${BASE_URL}/v1/apps/${id}/versions`,
  versionById: (id: number) => `${BASE_URL}/v1/apps/versions/${id}`,
  latestVersion: (appType: string) => `${BASE_URL}/v1/apps/latest-version?app_type=${appType}`,
  uploadApk: `${BASE_URL}/v1/apps/upload-apk`,
  devices: `${BASE_URL}/v1/devices/`,
  workingSessions: `${BASE_URL}/v1/working-sessions`,
  workingSessionsByUser: (userId: number) => `${BASE_URL}/v1/working-sessions/user/${userId}`,
  userManagerCreate: `${BASE_URL}/v1/user-manager/create`,
  userManagerById: (id: number) => `${BASE_URL}/v1/user-manager/${id}`,
  systemMonitor: `${BASE_URL}/v1/system-monitor/`,
  alembicVersionList: `${BASE_URL}/v1/admin/alembic-version/list`,
  alembicVersionCreate: `${BASE_URL}/v1/admin/alembic-version/create`,
  alembicVersionDelete: (versionNum: string) =>
    `${BASE_URL}/v1/admin/alembic-version/${versionNum}`,
  activity: (lang: string) => `${BASE_URL}/v1/activity?lang=${lang}`,
};
