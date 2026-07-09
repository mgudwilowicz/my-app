import type { SxProps, Theme } from "@mui/material/styles";

export const pageHeaderStyles = {
  container: { mb: 2.75 },
  title: { fontWeight: 700, fontSize: 20, color: "text.primary" },
  subtitle: { color: "text.disabled", mt: 0.5, fontSize: 13 },
} as const satisfies Record<string, SxProps<Theme>>;

export const pageContainerSx: SxProps<Theme> = {
  p: { xs: 2, sm: 3.5 },
  maxWidth: 960,
  overflowX: "hidden",
};

export const pageContainerNarrowSx: SxProps<Theme> = {
  p: { xs: 2, sm: 3.5 },
  maxWidth: 720,
};

export const pageToolbarSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 2,
  mb: 2.75,
  flexWrap: "wrap",
};

export const outlinedCardSx: SxProps<Theme> = {
  borderRadius: 3,
  borderColor: "divider",
  boxShadow: "none",
};

export const centeredLoaderSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  mt: 8,
};
