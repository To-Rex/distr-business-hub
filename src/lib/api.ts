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
  workingSession: (userId: number) => `${BASE_URL}/v1/working-sessions/user/${userId}?app=mx-agent&is_testing=false`,
} as const;
