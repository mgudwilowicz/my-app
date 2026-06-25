import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import type { DashboardMetrics } from "@appTypes/DailyLog";

type DashboardMetricsProps = {
  metrics: DashboardMetrics;
  pendingSubtitle: string;
};

const statItems: Array<{
  label: string;
  sub: string;
  value: (metrics: DashboardMetrics, pendingSubtitle: string) => string | number;
  color?: string;
}> = [
  {
    label: "Today's doses",
    sub: "across 4 slots",
    value: (m) => m.total,
  },
  {
    label: "Taken",
    sub: "completed",
    value: (m) => m.taken,
    color: "success.dark",
  },
  {
    label: "Pending",
    sub: "pendingSubtitle",
    value: (m) => m.pending,
    color: "warning.dark",
  },
  {
    label: "Complete",
    sub: "your progress",
    value: (m) => `${m.percent}%`,
  },
];

export default function DashboardMetricsBar({
  metrics,
  pendingSubtitle,
}: DashboardMetricsProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(4, 1fr)",
        },
        gap: 1.75,
        mb: 2.75,
      }}
    >
      {statItems.map((item) => (
        <Card
          key={item.label}
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Box sx={{ px: 2.25, py: 2 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.disabled",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                mb: 0.75,
              }}
            >
              {item.label}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: 26,
                lineHeight: 1.1,
                color: item.color ?? "text.primary",
              }}
            >
              {item.value(metrics, pendingSubtitle)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.disabled", fontWeight: 500, mt: 0.5, display: "block" }}
            >
              {item.sub === "pendingSubtitle" ? pendingSubtitle : item.sub}
            </Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
}
