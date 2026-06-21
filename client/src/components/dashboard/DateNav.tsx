import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getDashboardDateBounds } from "@appTypes/DailyLog";

type DateNavProps = {
  selectedDate: string;
  onDateChange: (date: string) => void;
};

function formatTabLabel(date: string): string {
  const bounds = getDashboardDateBounds();
  if (date === bounds.yesterday) return "Yesterday";
  if (date === bounds.today) return "Today";
  if (date === bounds.tomorrow) return "Tomorrow";
  return date;
}

export default function DateNav({ selectedDate, onDateChange }: DateNavProps) {
  const bounds = getDashboardDateBounds();
  const options = [
    { key: "yesterday", date: bounds.yesterday },
    { key: "today", date: bounds.today },
    { key: "tomorrow", date: bounds.tomorrow },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "inline-flex",
          gap: 0.25,
          bgcolor: "#f0f2f8",
          borderRadius: 2,
          p: 0.5,
        }}
      >
        {options.map((option) => {
          const active = selectedDate === option.date;
          return (
            <Box
              key={option.key}
              component="button"
              type="button"
              onClick={() => onDateChange(option.date)}
              sx={{
                border: "none",
                cursor: "pointer",
                px: 2,
                py: 0.75,
                borderRadius: 1.5,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                color: active ? "primary.dark" : "text.disabled",
                bgcolor: active ? "background.paper" : "transparent",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.12s",
              }}
            >
              {formatTabLabel(option.date)}
            </Box>
          );
        })}
      </Box>
      <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 1 }}>
        View yesterday, today, or tomorrow
      </Typography>
    </Box>
  );
}
