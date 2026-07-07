import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import type { FamilyOverviewSummary } from "@appTypes/FamilyOverview";
import { formatSummaryNames } from "../../utils/familyOverview";

type FamilyOverviewMetricsProps = {
  summary: FamilyOverviewSummary;
};

export default function FamilyOverviewMetrics({
  summary,
}: FamilyOverviewMetricsProps) {
  const items = [
    {
      label: "Members",
      value: summary.memberCount,
      sub: "in family group",
      color: undefined,
    },
    {
      label: "All taken",
      value: summary.allTakenCount,
      sub: formatSummaryNames(summary.allTakenNames),
      color: "success.dark",
    },
    {
      label: "Need attention",
      value: summary.needAttentionCount,
      sub: formatSummaryNames(summary.needAttentionNames),
      color: "error.dark",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(3, 1fr)",
        },
        gap: 1.75,
        mb: 2.75,
      }}
    >
      {items.map((item) => (
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
              {item.value}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                fontWeight: 500,
                mt: 0.5,
                display: "block",
              }}
            >
              {item.sub}
            </Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
}
