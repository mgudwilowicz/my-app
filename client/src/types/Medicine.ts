export type MedicineSlot = "morning" | "noon" | "evening" | "night";

/** Slots in display order (morning → night). */
export const MEDICINE_SLOTS: MedicineSlot[] = [
  "morning",
  "noon",
  "evening",
  "night",
];

export type Medicine = {
  id: number;
  family_id: number;
  assigned_to: number;
  name: string;
  dosage: string | null;
  slots: MedicineSlot[];
  notes: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  assigned_to_name?: string;
};

/** Full labels for forms and filters. */
export const SLOT_LABELS: Record<MedicineSlot, string> = {
  morning: "Morning",
  noon: "Noon",
  evening: "Evening",
  night: "Night",
};

/** Short labels for table pills (matches mock UI). */
export const SLOT_PILL_LABELS: Record<MedicineSlot, string> = {
  morning: "AM",
  noon: "Noon",
  evening: "PM",
  night: "Night",
};

export type SlotPillStyle = {
  bgcolor: string;
  color: string;
};

/** Background + text colors for slot chips (amber, info, purple, gray). */
export const SLOT_PILL_STYLES: Record<MedicineSlot, SlotPillStyle> = {
  morning: { bgcolor: "#fef3d6", color: "#7a4500" },
  noon: { bgcolor: "#ddeeff", color: "#0a3d7a" },
  evening: { bgcolor: "#eeecff", color: "#3d2fa0" },
  night: { bgcolor: "#e8e8e8", color: "#3a3a3a" },
};

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return value;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMedicinePeriod(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): string {
  const hasEndDate = Boolean(endDate?.trim());

  if (!hasEndDate) {
    if (!startDate?.trim()) {
      return "Ongoing";
    }
    return `${formatDisplayDate(startDate)} → Ongoing`;
  }

  const formattedEnd = formatDisplayDate(endDate);
  if (!startDate?.trim()) {
    return formattedEnd;
  }

  const formattedStart = formatDisplayDate(startDate);
  return `${formattedStart} → ${formattedEnd}`;
}
