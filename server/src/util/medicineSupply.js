export const VALID_FORM_TYPES = ["pill", "liquid"];

const PILL_FRACTION_SYMBOLS = {
  0.25: "¼",
  0.5: "½",
  0.75: "¾",
};

export function formatPillDosageLabel(doseAmount) {
  const amount = Math.round(Number(doseAmount) * 100) / 100;
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

export function formatDosageLabel(formType, doseAmount) {
  const amount = Number(doseAmount);
  if (!formType || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  if (formType === "pill") {
    return formatPillDosageLabel(amount);
  }

  return `${amount} ml`;
}

export function getDailyUsage(doseAmount, slots) {
  const dose = Number(doseAmount);
  const slotCount = Array.isArray(slots) ? slots.length : 0;
  if (!Number.isFinite(dose) || dose <= 0 || slotCount === 0) {
    return 0;
  }
  return dose * slotCount;
}

export function getDaysRemaining(remainingAmount, dailyUsage) {
  const remaining = Number(remainingAmount);
  const usage = Number(dailyUsage);
  if (!Number.isFinite(remaining) || remaining < 0 || !Number.isFinite(usage) || usage <= 0) {
    return null;
  }
  return Math.floor(remaining / usage);
}

export function validateSupplyFields({
  form_type: formType,
  dose_amount: doseAmount,
  package_size: packageSize,
  remaining_amount: remainingAmount,
  low_stock_threshold: lowStockThreshold,
}) {
  if (!formType) {
    return "form_type is required";
  }
  if (!VALID_FORM_TYPES.includes(formType)) {
    return "form_type must be pill or liquid";
  }

  const dose = Number(doseAmount);
  if (!Number.isFinite(dose) || dose <= 0) {
    return "dose_amount must be greater than 0";
  }

  const pkg = Number(packageSize);
  if (!Number.isFinite(pkg) || pkg <= 0) {
    return "package_size must be greater than 0";
  }

  const remaining = Number(remainingAmount);
  if (!Number.isFinite(remaining) || remaining < 0) {
    return "remaining_amount must be 0 or greater";
  }

  const threshold = Number(lowStockThreshold);
  if (!Number.isFinite(threshold) || threshold < 0) {
    return "low_stock_threshold must be 0 or greater";
  }

  return null;
}
