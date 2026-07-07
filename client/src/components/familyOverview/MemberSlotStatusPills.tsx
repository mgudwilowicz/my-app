import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import {
  MEDICINE_SLOTS,
  SLOT_LABELS,
  SLOT_PILL_STYLES,
  type MedicineSlot,
} from "@appTypes/Medicine";
import type { SlotComplianceStatus } from "@appTypes/FamilyOverview";

type MemberSlotStatusPillsProps = {
  slots: Record<MedicineSlot, SlotComplianceStatus>;
};

function getStatusSymbol(status: SlotComplianceStatus): string {
  switch (status) {
    case "complete":
      return "✓";
    case "missed":
      return "✗";
    default:
      return "–";
  }
}

function getStatusChipSx(
  slot: MedicineSlot,
  status: SlotComplianceStatus,
): object {
  const base = SLOT_PILL_STYLES[slot];

  if (status === "none") {
    return {
      bgcolor: "action.hover",
      color: "text.disabled",
      fontWeight: 600,
      fontSize: "0.6875rem",
      height: 24,
    };
  }

  if (status === "complete") {
    return {
      bgcolor: base.bgcolor,
      color: base.color,
      fontWeight: 600,
      fontSize: "0.6875rem",
      height: 24,
    };
  }

  if (status === "missed") {
    return {
      bgcolor: "error.light",
      color: "error.dark",
      fontWeight: 600,
      fontSize: "0.6875rem",
      height: 24,
    };
  }

  return {
    bgcolor: "warning.light",
    color: "warning.dark",
    fontWeight: 600,
    fontSize: "0.6875rem",
    height: 24,
  };
}

export default function MemberSlotStatusPills({
  slots,
}: MemberSlotStatusPillsProps) {
  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.75 }}>
      {MEDICINE_SLOTS.map((slot) => {
        const status = slots[slot];
        if (status === "none") return null;

        return (
          <Chip
            key={slot}
            size="small"
            label={`${SLOT_LABELS[slot]} ${getStatusSymbol(status)}`}
            sx={getStatusChipSx(slot, status)}
          />
        );
      })}
    </Box>
  );
}
