import React, { useState } from "react";
import { UserContext, type User } from "./UserContext";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
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

  const loadData = async () => {
    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("server error");
      }
      const data = await response.json();
      setUsers(data);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <UserContext.Provider
      value={{ users, currentUser, token, login, loadData, error }}
    >
      {children}
    </UserContext.Provider>
  );
}
