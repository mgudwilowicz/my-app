import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import type { DashboardData } from "@appTypes/DailyLog";
import { formatShortDashboardDate } from "@appTypes/DailyLog";
import { MEDICINE_SLOTS, type MedicineSlot } from "@appTypes/Medicine";
import { outlinedCardSx } from "../../theme/pageStyles";
import SlotSection from "./SlotSection";

type DashboardChecklistCardProps = {
  dashboard: DashboardData;
  togglingKey: string | null;
  onToggle: (slot: MedicineSlot, medicineId: number, taken: boolean) => void;
};

export default function DashboardChecklistCard({
  dashboard,
  togglingKey,
  onToggle,
}: DashboardChecklistCardProps) {
  const dateLabel = formatShortDashboardDate(dashboard.date);
  const progressLabel = `${dashboard.metrics.taken} / ${dashboard.metrics.total} taken`;

  return (
    <Card
      variant="outlined"
      sx={{
        ...outlinedCardSx,
        p: { xs: 2, sm: 2.25 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 14 }}>
          My medicines — {dateLabel}
        </Typography>
        <Chip
          label={progressLabel}
          size="small"
          sx={{
            bgcolor: "primary.light",
            color: "primary.dark",
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      </Box>

      {MEDICINE_SLOTS.map((slot) => (
        <SlotSection
          key={slot}
          slot={slot}
          entries={dashboard.slots[slot]}
          togglingKey={togglingKey}
          onToggle={onToggle}
        />
      ))}
    </Card>
  );
}
