import type { SxProps, Theme } from "@mui/material/styles";
import { outlinedCardSx } from "./pageStyles";

/** Outer shell for medicine tables — single radius, clips header/body together. */
export const medicineTableCardSx: SxProps<Theme> = {
  ...outlinedCardSx,
  overflow: "hidden",
};

export const medicineTableSx: SxProps<Theme> = {
  "& th": {
    fontSize: "0.6875rem",
    fontWeight: 700,
    color: "text.disabled",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1.5px solid",
    borderColor: "divider",
    py: 1,
    px: 1.5,
  },
  "& td": {
    fontSize: "0.8125rem",
    fontWeight: 500,
    py: 1.25,
    px: 1.5,
    borderBottom: "1px solid",
    borderColor: "divider",
    verticalAlign: "middle",
  },
  "& tbody tr:last-child td": {
    borderBottom: "none",
  },
  "& tbody tr:hover td": {
    bgcolor: "primary.light",
  },
};
