import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { DashboardMedicineEntry } from "@appTypes/DailyLog";
import {
  SLOT_DOT_COLORS,
  SLOT_HEADER_COLORS,
  SLOT_TIMES,
} from "@appTypes/DailyLog";
import { SLOT_LABELS, type MedicineSlot } from "@appTypes/Medicine";
import MedicineRow from "./MedicineRow";

type SlotSectionProps = {
  slot: MedicineSlot;
  entries: DashboardMedicineEntry[];
  togglingKey: string | null;
  onToggle: (slot: MedicineSlot, medicineId: number, taken: boolean) => void;
};

export default function SlotSection({
  slot,
  entries,
  togglingKey,
  onToggle,
}: SlotSectionProps) {
  return (
    <Box sx={{ mb: 2.25 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.875,
          mb: 1,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: SLOT_DOT_COLORS[slot],
            flexShrink: 0,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: SLOT_HEADER_COLORS[slot],
            fontSize: 11,
          }}
        >
          {SLOT_LABELS[slot]} — {SLOT_TIMES[slot]}
        </Typography>
      </Box>

      {entries.length === 0 ? (
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ px: 1.5, py: 0.5, fontSize: 13, fontWeight: 500 }}
        >
          No medicines
        </Typography>
      ) : (
        entries.map((entry) => {
          const rowKey = `${slot}:${entry.medicine_id}`;
          return (
            <MedicineRow
              key={rowKey}
              entry={entry}
              slot={slot}
              disabled={togglingKey === rowKey}
              onToggle={(medicineId, taken) =>
                onToggle(slot, medicineId, taken)
              }
            />
          );
        })
      )}
    </Box>
  );
}
