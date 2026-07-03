import type { SxProps, Theme } from "@mui/material/styles";

export const pageHeaderStyles = {
  container: { mb: 2.75 },
  title: { fontWeight: 700, fontSize: 20, color: "text.primary" },
  subtitle: { color: "text.disabled", mt: 0.5, fontSize: 13 },
} as const satisfies Record<string, SxProps<Theme>>;
