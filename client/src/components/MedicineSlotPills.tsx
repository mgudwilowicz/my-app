import Box from "@mui/material/Box";
import { MEDICINE_SLOTS, type MedicineSlot } from "@appTypes/Medicine";
import { MedicineSlotPill } from "./MedicineSlotPill";

type MedicineSlotPillsProps = {
  slots: MedicineSlot[];
};

/** Row of slot pills in morning → night order. */
export function MedicineSlotPills({ slots }: MedicineSlotPillsProps) {
  const ordered = MEDICINE_SLOTS.filter((slot) => slots.includes(slot));

  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
      {ordered.map((slot) => (
        <MedicineSlotPill key={slot} slot={slot} />
      ))}
    </Box>
  );
}
