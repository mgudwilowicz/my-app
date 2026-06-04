import { createContext, useContext } from "react";
import type { Family, FamilyMemberRole } from "@appTypes/Family";

export type FamilyContextType = {
  families: Family[];
  activeFamily: Family | null;
  activeFamilyId: number | null;
  setActiveFamilyId: (id: number) => void;
  loading: boolean;
  refreshFamilies: () => Promise<Family[]>;
  role: FamilyMemberRole | null;
  isAdmin: boolean;
};

export const FamilyContext = createContext<FamilyContextType | undefined>(
  undefined,
);

export function useFamilyContext() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error("useFamilyContext must be used within FamilyProvider");
  }
  return context;
}
