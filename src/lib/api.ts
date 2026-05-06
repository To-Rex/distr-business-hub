const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const WS_BASE = BASE_URL.replace(/^https?/, "wss");

export const API = {
  login: `${BASE_URL}/v1/authentication/login`,
  profile: `${BASE_URL}/v1/authentication/profile`,
  wsLocations: (token: string) => `${WS_BASE}/v1/locations/ws/admvs?token=${token}`,
  userHistory: (userId: number) => `${BASE_URL}/v1/locations/user-history/${userId}`,
  workingSession: (userId: number) =>
    `${BASE_URL}/v1/working-sessions/user/${userId}?app=mx-agent&is_testing=false`,
  clientLocations: (baseUrl: string) =>
    `/proxy-1c?target=${encodeURIComponent(baseUrl)}&path=/hs/manager/api/get_location_all`,
  clientInfo: (baseUrl: string, clientId: number) =>
    `/proxy-1c?target=${encodeURIComponent(baseUrl)}&path=/hs/manager/api/get_client_info?client_id=${clientId}`,
  clientVisitData: (baseUrl: string, clientId: number) =>
    `/proxy-1c?target=${encodeURIComponent(baseUrl)}&path=/hs/manager/api/get_visit_data_by_client?client_id=${clientId}`,
  clientsByGroup: (baseUrl: string) =>
    `/proxy-1c?target=${encodeURIComponent(baseUrl)}&path=/hs/manager/api/GetClientsbyGroup`,
} as const;
