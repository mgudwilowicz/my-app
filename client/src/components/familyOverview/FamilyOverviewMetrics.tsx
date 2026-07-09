import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import type { FamilyOverviewSummary } from "@appTypes/FamilyOverview";
import { outlinedCardSx } from "../../theme/pageStyles";
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
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: { xs: 1, sm: 1.75 },
        mb: 2.75,
      }}
    >
      {items.map((item) => (
        <Card key={item.label} variant="outlined" sx={outlinedCardSx}>
          <Box sx={{ px: { xs: 1.25, sm: 2.25 }, py: { xs: 1.25, sm: 2 } }}>
            <Typography
              variant="caption"
              noWrap
              sx={{
                display: "block",
                color: "text.disabled",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontSize: { xs: "0.625rem", sm: "0.75rem" },
                mb: { xs: 0.5, sm: 0.75 },
              }}
            >
              {item.label}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: 20, sm: 26 },
                lineHeight: 1.1,
                color: item.color ?? "text.primary",
              }}
            >
              {item.value}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: "text.disabled",
                fontWeight: 500,
                mt: 0.5,
                display: "block",
                fontSize: { xs: "0.625rem", sm: "0.75rem" },
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
