import type { SxProps, Theme } from "@mui/material/styles";

/** Shared table look for medicine pages (matches medifamily-ui mock). */
export const medicineTableContainerSx: SxProps<Theme> = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  overflow: "hidden",
};

export const medicineTableSx: SxProps<Theme> = {
  "& th": {
    fontSize: "0.6875rem",
    fontWeight: 700,
    color: "text.disabled",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    bgcolor: "#f8f9ff",
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
    bgcolor: "#f8f9ff",
  },
};
