import { useCallback, useEffect, useRef } from "react";
import { useUserContext } from "@/context/UserContext";

export function useAuthFetch() {
  const { logout, updateToken, token } = useUserContext();
  const API = import.meta.env.VITE_PUBLIC_API_HOST;

  // Refs so the stable callback always has the latest values
  // without needing them as useCallback dependencies.
  const tokenRef = useRef(token);
  const logoutRef = useRef(logout);
  const updateTokenRef = useRef(updateToken);

  useEffect(() => { tokenRef.current = token; }, [token]);
  useEffect(() => { logoutRef.current = logout; }, [logout]);
  useEffect(() => { updateTokenRef.current = updateToken; }, [updateToken]);

  return useCallback(
    async function authFetch(path: string, options: RequestInit = {}) {
      const headers = {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
        Authorization: `Bearer ${tokenRef.current}`,
      };

      let response = await fetch(`${API}${path}`, {
        ...options,
        headers,
        credentials: "include", // sends the httpOnly cookie on every request
      });

      if (response.status === 403) {
        // Try to refresh
        const refreshRes = await fetch(`${API}/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          const { accessToken } = await refreshRes.json();
          updateTokenRef.current(accessToken);
          // Retry original request with new token
          response = await fetch(`${API}${path}`, {
            ...options,
            headers: { ...headers, Authorization: `Bearer ${accessToken}` },
            credentials: "include",
          });
        } else {
          logoutRef.current();
          throw new Error("Session expired. Please log in again.");
        }
      }

      return response;
    },
    [API], // API comes from import.meta.env — stable for the lifetime of the app
  );
}
