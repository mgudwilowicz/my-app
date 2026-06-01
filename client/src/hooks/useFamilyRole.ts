import { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import { useAuthFetch } from "./useAuthFetch";
import type { FamilyMemberRole } from "@appTypes/Family";

export function useFamilyRole() {
  const { currentUser } = useUserContext();
  const authFetch = useAuthFetch();
  const [role, setRole] = useState<FamilyMemberRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setRole(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const listRes = await authFetch("/families");
        if (!listRes.ok) throw new Error("Failed to load families");
        const families = await listRes.json();
        if (!families.length) {
          if (!cancelled) setRole(null);
          return;
        }

        const detailRes = await authFetch(`/families/${families[0].id}`);
        if (!detailRes.ok) throw new Error("Failed to load family");
        const family = await detailRes.json();
        const me = family.members?.find(
          (m: { id: number }) => m.id === currentUser.id,
        );
        if (!cancelled) setRole(me?.role ?? null);
      } catch {
        if (!cancelled) setRole(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    load();

    return () => {
      cancelled = true;
    };
  }, [currentUser, authFetch]);

  return { role, loading, isAdmin: role === "admin" };
}
