import Chip from "@mui/material/Chip";
import {
  SLOT_PILL_LABELS,
  SLOT_PILL_STYLES,
  type MedicineSlot,
} from "@appTypes/Medicine";

type MedicineSlotPillProps = {
  slot: MedicineSlot;
};

/** One colored pill for a time slot (AM, Noon, PM, Night). */
export function MedicineSlotPill({ slot }: MedicineSlotPillProps) {
  const style = SLOT_PILL_STYLES[slot];

  return (
    <Chip
      label={SLOT_PILL_LABELS[slot]}
      size="small"
      sx={{
        bgcolor: style.bgcolor,
        color: style.color,
        fontWeight: 600,
        fontSize: "0.6875rem",
        height: 24,
      }}
    />
  );
}
