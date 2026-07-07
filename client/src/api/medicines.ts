import type { Medicine, MedicineFormType, MedicineSlot } from "@appTypes/Medicine";

export type AuthFetch = (
  path: string,
  options?: RequestInit,
) => Promise<Response>;

export async function fetchMedicines(
  authFetch: AuthFetch,
  familyId: number,
): Promise<Medicine[]> {
  const response = await authFetch(`/medicines?family_id=${familyId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to load medicines");
  }
  return data;
}

export type CreateMedicineInput = {
  family_id: number;
  assigned_to: number;
  name: string;
  dosage: string;
  form_type: MedicineFormType;
  dose_amount: number;
  remaining_amount: number;
  low_stock_threshold: number;
  slots: MedicineSlot[];
  notes: string | null;
  start_date: string;
  end_date: string | null;
};

export type UpdateMedicineInput = {
  assigned_to?: number;
  name: string;
  dosage: string;
  form_type: MedicineFormType;
  dose_amount: number;
  remaining_amount: number;
  low_stock_threshold: number;
  slots: MedicineSlot[];
  notes: string | null;
  start_date: string;
  end_date: string | null;
};

export async function createMedicine(
  authFetch: AuthFetch,
  input: CreateMedicineInput,
): Promise<Medicine> {
  const response = await authFetch("/medicines", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to save medicine");
  }
  return data;
}

export async function updateMedicine(
  authFetch: AuthFetch,
  medicineId: number,
  input: UpdateMedicineInput,
): Promise<Medicine> {
  const response = await authFetch(`/medicines/${medicineId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to save medicine");
  }
  return data;
}

export async function deactivateMedicine(
  authFetch: AuthFetch,
  medicineId: number,
): Promise<Medicine> {
  const response = await authFetch(`/medicines/${medicineId}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to deactivate medicine");
  }
  return data;
}
