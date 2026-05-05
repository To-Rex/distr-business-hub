const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export const API = {
  login: `${BASE_URL}/v1/authentication/login`,
  profile: `${BASE_URL}/v1/authentication/profile`,
} as const;
