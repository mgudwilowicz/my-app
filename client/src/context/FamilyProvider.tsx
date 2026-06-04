import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Family } from "@appTypes/Family";
import { useUserContext } from "./UserContext";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { FamilyContext } from "./FamilyContext";

const storageKey = (userId: number) => `activeFamilyId:${userId}`;

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUserContext();
  const authFetch = useAuthFetch();
  const [families, setFamilies] = useState<Family[]>([]);
  const [activeFamilyId, setActiveFamilyIdState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const setActiveFamilyId = useCallback(
    (id: number) => {
      setActiveFamilyIdState(id);
      if (currentUser) {
        localStorage.setItem(storageKey(currentUser.id), String(id));
      }
    },
    [currentUser],
  );

  const refreshFamilies = useCallback(async () => {
    if (!currentUser) {
      setFamilies([]);
      setActiveFamilyIdState(null);
      setLoading(false);
      return [];
    }

    setLoading(true);
    try {
      const response = await authFetch("/families");
      if (!response.ok) {
        throw new Error("Failed to load families");
      }
      const data: Family[] = await response.json();
      setFamilies(data);

      const storedId = Number(
        localStorage.getItem(storageKey(currentUser.id)),
      );
      const validStored = data.some((f) => f.id === storedId);
      const nextId = validStored ? storedId : (data[0]?.id ?? null);
      setActiveFamilyIdState(nextId);
      if (nextId !== null) {
        localStorage.setItem(storageKey(currentUser.id), String(nextId));
      }

      return data;
    } catch {
      setFamilies([]);
      setActiveFamilyIdState(null);
      return [];
    } finally {
      setLoading(false);
    }
  }, [authFetch, currentUser]);

  useEffect(() => {
    refreshFamilies();
  }, [refreshFamilies]);

  const activeFamily = useMemo(
    () => families.find((f) => f.id === activeFamilyId) ?? null,
    [families, activeFamilyId],
  );

  const role = activeFamily?.role ?? null;

  const value = useMemo(
    () => ({
      families,
      activeFamily,
      activeFamilyId,
      setActiveFamilyId,
      loading,
      refreshFamilies,
      role,
      isAdmin: role === "admin",
    }),
    [
      families,
      activeFamily,
      activeFamilyId,
      setActiveFamilyId,
      loading,
      refreshFamilies,
      role,
    ],
  );

  return (
    <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
  );
}
