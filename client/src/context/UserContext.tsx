import { createContext, useContext } from "react";

export type User = {
  id: number;
  email: string;
  name: string | null;
};

export type UserContextType = {
  isInitialized: boolean;
  currentUser: User | null;
  token: string | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ error: string } | { message: string }>;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: string } | { message: string }>;
  logout: () => Promise<void>;
  updateToken: (token: string) => void;
  error: string | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within UserProvider");
  }
  return context;
}
