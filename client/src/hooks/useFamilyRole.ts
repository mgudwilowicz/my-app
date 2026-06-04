import { useFamilyContext } from "../context/FamilyContext";

export function useFamilyRole() {
  const { role, loading, isAdmin } = useFamilyContext();
  return { role, loading, isAdmin };
}
