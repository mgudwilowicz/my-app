import {
  MEDICINE_SLOTS,
  SLOT_LABELS,
  type MedicineSlot,
} from "@appTypes/Medicine";

export type DashboardMedicineEntry = {
  medicine_id: number;
  name: string;
  dosage: string | null;
  notes: string | null;
  taken: boolean;
  taken_at: string | null;
};

export const SLOT_DOT_COLORS: Record<MedicineSlot, string> = {
  morning: "#d48a00",
  noon: "#2f9bd6",
  evening: "#4cc3a1",
  night: "#87a3b8",
};

export const SLOT_HEADER_COLORS: Record<MedicineSlot, string> = {
  morning: "#7a4500",
  noon: "#2b6f96",
  evening: "#2b6f96",
  night: "#547189",
};

export type DashboardMetrics = {
  total: number;
  taken: number;
  pending: number;
  percent: number;
};

export type DashboardData = {
  date: string;
  metrics: DashboardMetrics;
  slots: Record<MedicineSlot, DashboardMedicineEntry[]>;
};

export const SLOT_TIMES: Record<MedicineSlot, string> = {
  morning: "08:00",
  noon: "12:00",
  evening: "18:00",
  night: "21:00",
};

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDashboardDateBounds(): {
  yesterday: string;
  today: string;
  tomorrow: string;
} {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return {
    yesterday: formatLocalDate(yesterday),
    today: formatLocalDate(today),
    tomorrow: formatLocalDate(tomorrow),
  };
}

export function isDateInDashboardRange(
  date: string,
  bounds: { yesterday: string; today: string; tomorrow: string },
): boolean {
  return (
    date === bounds.yesterday ||
    date === bounds.today ||
    date === bounds.tomorrow
  );
}

export function computeMetrics(
  slots: Record<MedicineSlot, DashboardMedicineEntry[]>,
): DashboardMetrics {
  let total = 0;
  let taken = 0;

  for (const entries of Object.values(slots)) {
    for (const entry of entries) {
      total += 1;
      if (entry.taken) taken += 1;
    }
  }

  const pending = total - taken;
  const percent = total > 0 ? Math.round((taken / total) * 100) : 0;

  return { total, taken, pending, percent };
}

export function formatDashboardDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDashboardDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getPendingSlotsLabel(
  slots: Record<MedicineSlot, DashboardMedicineEntry[]>,
): string {
  const pendingSlots = MEDICINE_SLOTS.filter((slot) =>
    slots[slot].some((entry) => !entry.taken),
  );

  if (pendingSlots.length === 0) {
    return "all done";
  }

  return pendingSlots.map((slot) => SLOT_LABELS[slot].toLowerCase()).join(" + ");
}

export function formatMedicineDoseLine(
  dosage: string | null,
  notes: string | null,
): string | null {
  const parts = [dosage?.trim(), notes?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}
