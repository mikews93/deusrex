import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3501";

export function useApi() {
  const { getToken } = useAuth();

  const apiCall = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const token = await getToken();

      const config: RequestInit = {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const response = await fetch(`${API_URL}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(
          `API call failed: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    },
    [getToken]
  );

  return { apiCall };
}
