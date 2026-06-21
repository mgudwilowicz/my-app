import type { MedicineSlot } from "@appTypes/Medicine";
import type { DashboardData } from "@appTypes/DailyLog";

export type AuthFetch = (
  path: string,
  options?: RequestInit,
) => Promise<Response>;

export type UpsertLogInput = {
  family_id: number;
  medicine_id: number;
  slot: MedicineSlot;
  taken: boolean;
  date: string;
};

export async function fetchDashboard(
  authFetch: AuthFetch,
  familyId: number,
  date: string,
): Promise<DashboardData> {
  const response = await authFetch(
    `/logs?family_id=${familyId}&date=${encodeURIComponent(date)}`,
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to load dashboard");
  }
  return data;
}

export async function upsertLog(
  authFetch: AuthFetch,
  input: UpsertLogInput,
): Promise<void> {
  const response = await authFetch("/logs", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to save log");
  }
}
