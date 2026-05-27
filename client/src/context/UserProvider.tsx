import React, { useEffect, useState } from "react";
import { UserContext, type User } from "./UserContext";
import { useNavigate } from "react-router";

const API = import.meta.env.VITE_PUBLIC_API_HOST;

export function UserProvider({ children }: { children: React.ReactNode }) {
  let navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function initializeContext() {
      try {
        const res = await fetch(`${API}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Response failed with status " + res.status);
        }
        console.log("refresh successul");
        const data = await res.json();
        setToken(data.accessToken);
        setCurrentUser({
          id: data.userId,
          email: data.email,
          name: data.userName,
        });
        setError(null);
      } catch (err) {
        console.log("refresh failed");
        console.log(err);
        setToken(null);
        setCurrentUser(null);
      } finally {
        setIsInitialized(true);
      }
    }
    initializeContext();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "server error");
      }
      const data = await response.json();
      setCurrentUser({ id: data.userId, email: data.email, name: data.name });
      setToken(data.accessToken);
      setError(null);

      return data;
    } catch (err) {
      console.log(err);
      setToken(null);
      setCurrentUser(null);
      setError(err instanceof Error ? err.message : "unknown error");
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log("REGISTER START");
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "server error");
      }

      const data = await response.json();
      setCurrentUser({
        id: data.userId,
        email: data.email,
        name: data.userName,
      });
      setToken(data.accessToken);
      console.log("access token:", data.accessToken);
      setError(null);
      navigate("/login");
      return data;
    } catch (err) {
      console.log(err);
      setError(err instanceof Error ? err.message : "unknown error");
      setCurrentUser(null);
      setToken(null);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "server error");
      }
      const data = await response.json();
      console.log(data);
      setCurrentUser(null);
      setToken(null);
      setError(null);
    } catch (err) {
      console.log(err);
      setError(err instanceof Error ? err.message : "unknown error");
      setCurrentUser(null);
      setToken(null);
    }
  };

  function updateToken(newToken: string) {
    setToken(newToken);
  }

  if (!isInitialized) {
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        isInitialized,
        currentUser,
        token,
        login,
        register,
        logout,
        updateToken,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
