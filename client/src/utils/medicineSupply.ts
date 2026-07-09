import type { MedicineFormType, MedicineSlot } from "@appTypes/Medicine";

export type SupplyStatus = "untracked" | "ok" | "low" | "empty";

/** Whole numbers without decimals; fractional values keep up to 2 decimal places. */
export function formatSupplyAmount(
  value: number | string | null | undefined,
): string {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return String(value ?? "");
  }

  const rounded = Math.round(num * 100) / 100;
  if (Number.isInteger(rounded)) {
    return String(rounded);
  }

  return String(rounded);
}

const PILL_FRACTION_SYMBOLS: Record<number, string> = {
  0.25: "¼",
  0.5: "½",
  0.75: "¾",
};

export function formatPillDosageLabel(doseAmount: number): string {
  const amount = Math.round(doseAmount * 100) / 100;
  const whole = Math.floor(amount);
  const fraction = Math.round((amount - whole) * 100) / 100;
  const fractionSymbol = PILL_FRACTION_SYMBOLS[fraction];

  if (fraction === 0) {
    return whole === 1 ? "1 pill" : `${whole} pills`;
  }

  if (whole === 0 && fractionSymbol) {
    return `${fractionSymbol} pill`;
  }

  if (fractionSymbol) {
    return `${whole}${fractionSymbol} pills`;
  }

  return amount === 1 ? "1 pill" : `${amount} pills`;
}

export function formatDosageLabel(
  formType: MedicineFormType | null | undefined,
  doseAmount: number,
): string | null {
  if (!formType || !Number.isFinite(doseAmount) || doseAmount <= 0) {
    return null;
  }

  if (formType === "pill") {
    return formatPillDosageLabel(doseAmount);
  }

  return `${doseAmount} ml`;
}

export function getDailyUsage(
  doseAmount: number,
  slots: MedicineSlot[],
): number {
  if (!Number.isFinite(doseAmount) || doseAmount <= 0 || slots.length === 0) {
    return 0;
  }
  return doseAmount * slots.length;
}

export function getDaysRemaining(
  remainingAmount: number,
  dailyUsage: number,
): number | null {
  if (
    !Number.isFinite(remainingAmount) ||
    remainingAmount < 0 ||
    !Number.isFinite(dailyUsage) ||
    dailyUsage <= 0
  ) {
    return null;
  }
  return Math.floor(remainingAmount / dailyUsage);
}

export function getSupplyUnitLabel(
  formType: MedicineFormType | null | undefined,
  count = 1,
): string {
  if (formType === "pill") {
    return count === 1 ? "pill" : "pills";
  }
  if (formType === "liquid") {
    return "ml";
  }
  return "";
}

export function getSupplyStatus(
  formType: MedicineFormType | null | undefined,
  remainingAmount: number | null | undefined,
  lowStockThreshold: number | null | undefined,
): SupplyStatus {
  if (!formType || remainingAmount == null) {
    return "untracked";
  }

  const remaining = Number(remainingAmount);
  if (!Number.isFinite(remaining)) {
    return "untracked";
  }

  if (remaining <= 0) {
    return "empty";
  }

  if (lowStockThreshold != null) {
    const threshold = Number(lowStockThreshold);
    if (Number.isFinite(threshold) && remaining <= threshold) {
      return "low";
    }
  }

  return "ok";
}

export function formatSupplySummary(
  formType: MedicineFormType | null | undefined,
  remainingAmount: number | null | undefined,
  doseAmount: number | null | undefined,
  slots: MedicineSlot[],
): string | null {
  if (!formType || remainingAmount == null) {
    return null;
  }

  const unit = getSupplyUnitLabel(formType, remainingAmount);
  const formattedRemaining = formatSupplyAmount(remainingAmount);
  const daysRemaining = getDaysRemaining(
    remainingAmount,
    getDailyUsage(Number(doseAmount), slots),
  );

  if (daysRemaining === null) {
    return `${formattedRemaining} ${unit}`;
  }

  return `${formattedRemaining} ${unit} (~${daysRemaining} days)`;
}

export function formatSupplyPreview(
  formType: MedicineFormType | null | undefined,
  doseAmount: number,
  remainingAmount: number,
  lowStockThreshold: number,
  slots: MedicineSlot[],
): string | null {
  if (!formType || doseAmount <= 0 || slots.length === 0) {
    return null;
  }

  const summary = formatSupplySummary(
    formType,
    remainingAmount,
    doseAmount,
    slots,
  );
  const thresholdUnit = getSupplyUnitLabel(formType, lowStockThreshold);
  const status = getSupplyStatus(formType, remainingAmount, lowStockThreshold);

  if (!summary) {
    return null;
  }

  if (status === "empty") {
    return `${summary} — out of supply, order a new package`;
  }

  if (status === "low") {
    return `${summary} — order a new package (at or below ${formatSupplyAmount(lowStockThreshold)} ${thresholdUnit})`;
  }

  return `${summary} — notification at ${formatSupplyAmount(lowStockThreshold)} ${thresholdUnit} or fewer`;
}

export function getRefillTooltipMessage(
  status: SupplyStatus,
  formType: MedicineFormType | null | undefined,
  remainingAmount: number | null | undefined,
): string | null {
  if (status === "low" && formType && remainingAmount != null) {
    const unit = getSupplyUnitLabel(formType, remainingAmount);
    return `Order next package — only ${formatSupplyAmount(remainingAmount)} ${unit} left`;
  }
  if (status === "empty") {
    return "Out of supply — order a new package";
  }
  return null;
}
