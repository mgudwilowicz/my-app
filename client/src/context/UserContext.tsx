import { createContext, useContext } from "react";

export type User = {
  id: number;
  email: string;
};

export type UserContextType = {
  isInitialized: boolean;
  currentUser: User | null;
  token: string | null;
  login: (email: string, password: string) => void;
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
