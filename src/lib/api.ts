const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const WS_BASE = BASE_URL.replace(/^https?/, "wss");
const proxied1C = (baseUrl: string, path: string) =>
  `/proxy-1c?target=${encodeURIComponent(baseUrl)}&path=${encodeURIComponent(path)}`;

export const API = {
  login: `${BASE_URL}/v1/authentication/login`,
  profile: `${BASE_URL}/v1/authentication/profile`,
  wsLocations: (token: string) => `${WS_BASE}/v1/locations/ws/admvs?token=${token}`,
  userHistory: (userId: number) => `${BASE_URL}/v1/locations/user-history/${userId}`,
  workingSession: (userId: number, role?: string) => {
    const appRole = role ? (role.toLowerCase() === "deliverer" ? "delivery" : role.toLowerCase()) : "agent";
    return `${BASE_URL}/v1/working-sessions/user/${userId}?app=mx-${appRole}&is_testing=false`;
  },
  clientLocations: (baseUrl: string) =>
    proxied1C(baseUrl, "/hs/manager/api/get_location_all"),
  clientInfo: (baseUrl: string, clientId: number) =>
    proxied1C(baseUrl, `/hs/manager/api/get_client_info?client_id=${clientId}`),
  clientVisitData: (baseUrl: string, clientId: number) =>
    proxied1C(baseUrl, `/hs/manager/api/get_visit_data_by_client?client_id=${clientId}`),
  clientsByGroup: (baseUrl: string) =>
    proxied1C(baseUrl, "/hs/manager/api/GetClientsbyGroup"),
  employees: (baseUrl: string) => proxied1C(baseUrl, "/hs/manager/api/get_employees"),
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
} as const;
