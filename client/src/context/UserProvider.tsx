import React, { useEffect, useState } from "react";
import { UserContext, type User } from "./UserContext";

const API = import.meta.env.VITE_PUBLIC_API_HOST;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function initializeContext() {
      try {
        const res = await fetch(`${API}/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Response failed with status " + res.status);
        }
        console.log("refresh successul");
        const data = await res.json();
        setToken(data.accessToken);
        setCurrentUser({ id: data.userId, email: data.email });
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
      const response = await fetch("http://localhost:3000/login", {
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
        throw new Error(
          response.status === 401 ? "invalid credentials" : "server error",
        );
      }
      const data = await response.json();
      setCurrentUser({ id: data.userId, email: data.email });
      setToken(data.accessToken);
      console.log(data);
    } catch (err) {
      console.log(err);
      setError(err instanceof Error ? err.message : "unknown error");
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "invalid token" : "server error",
        );
      }
      const data = await response.json();
      console.log(data);
      setCurrentUser(null);
      setToken(null);
    } catch (err) {
      console.log(err);
      setError(err instanceof Error ? err.message : "unknown error");
    }
  };

  function updateToken(newToken: string) {
    setToken(newToken);
  }

  return (
    <UserContext.Provider
      value={{
        isInitialized,
        currentUser,
        token,
        login,
        logout,
        updateToken,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
