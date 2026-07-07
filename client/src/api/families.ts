import type { Family } from "@appTypes/Family";
import type { FamilyOverviewData } from "@appTypes/FamilyOverview";
import type { AuthFetch } from "./medicines";

export async function fetchFamily(
  authFetch: AuthFetch,
  familyId: number,
): Promise<Family> {
  const response = await authFetch(`/families/${familyId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to load family");
  }
  return data;
}

export async function fetchFamilyOverview(
  authFetch: AuthFetch,
  familyId: number,
  date: string,
): Promise<FamilyOverviewData> {
  const response = await authFetch(
    `/families/${familyId}/overview?date=${encodeURIComponent(date)}`,
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to load family overview");
  }
  return data;
}
