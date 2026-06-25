import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import type { DashboardMedicineEntry } from "@appTypes/DailyLog";
import {
  SLOT_TIMES,
  formatMedicineDoseLine,
} from "@appTypes/DailyLog";
import type { MedicineSlot } from "@appTypes/Medicine";

type MedicineRowProps = {
  entry: DashboardMedicineEntry;
  slot: MedicineSlot;
  disabled?: boolean;
  onToggle: (medicineId: number, taken: boolean) => void;
};

function formatTakenTime(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getStatusPill(
  entry: DashboardMedicineEntry,
  slot: MedicineSlot,
): { label: string; sx: object } {
  if (entry.taken) {
    const time = formatTakenTime(entry.taken_at);
    return {
      label: time ? `Taken ${time}` : "Taken",
      sx: {
        bgcolor: "success.light",
        color: "success.dark",
        fontWeight: 600,
      },
    };
  }

  const dueTime = SLOT_TIMES[slot];
  const isNight = slot === "night";

  return {
    label: `Due ${dueTime}`,
    sx: {
      bgcolor: isNight ? "action.hover" : "warning.light",
      color: isNight ? "text.secondary" : "warning.dark",
      fontWeight: 600,
    },
  };
}

export default function MedicineRow({
  entry,
  slot,
  disabled = false,
  onToggle,
}: MedicineRowProps) {
  const doseLine = formatMedicineDoseLine(entry.dosage, entry.notes);
  const statusPill = getStatusPill(entry, slot);

  const handleToggle = () => {
    if (disabled) return;
    onToggle(entry.medicine_id, !entry.taken);
  };

  return (
    <Box
      onClick={handleToggle}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleToggle();
        }
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 1.5,
        py: 1.125,
        mb: 0.625,
        borderRadius: 2,
        border: "1px solid",
        borderColor: entry.taken ? "success.main" : "divider",
        bgcolor: entry.taken ? "success.light" : "background.paper",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.7 : 1,
        transition: "all 0.12s",
        "&:hover": disabled
          ? undefined
          : {
              borderColor: entry.taken ? "success.main" : "divider",
              bgcolor: entry.taken ? "success.light" : "primary.light",
            },
      }}
    >
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: 1.25,
          border: "2px solid",
          borderColor: entry.taken ? "success.main" : "divider",
          bgcolor: entry.taken ? "success.main" : "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.12s",
        }}
      >
        {entry.taken && (
          <CheckIcon sx={{ fontSize: 14, color: "common.white", strokeWidth: 3 }} />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.primary", fontSize: 13 }}
        >
          {entry.name}
        </Typography>
        {doseLine && (
          <Typography
            variant="caption"
            sx={{ color: "text.disabled", fontWeight: 500, display: "block", mt: 0.25 }}
          >
            {doseLine}
          </Typography>
        )}
      </Box>

      <Chip
        size="small"
        label={statusPill.label}
        sx={{
          ...statusPill.sx,
          fontSize: 11,
          height: 24,
          borderRadius: 10,
        }}
      />
    </Box>
  );
}
