import { createTheme } from "@mui/material/styles";
import { brandColors, brandGradients, brandShadows } from "./tokens";

const theme = createTheme({
  palette: {
    primary: {
      main: brandColors.blue,
      light: brandColors.bgMid,
      dark: brandColors.blueDark,
    },
    success: {
      main: brandColors.teal,
      light: "#d8f3ec",
      dark: brandColors.tealDark,
    },
    warning: {
      main: "#c87a00",
      light: "#fff3cc",
      dark: "#7a4500",
    },
    error: {
      main: "#d43535",
      light: "#fde8e8",
      dark: "#8b1a1a",
    },
    info: {
      main: brandColors.blueMid,
      light: brandColors.bgMid,
      dark: brandColors.blueDark,
      contrastText: brandColors.navy,
    },
    background: {
      default: brandColors.bgStart,
      paper: brandColors.white,
    },
    text: {
      primary: brandColors.navy,
      secondary: brandColors.slate,
      disabled: brandColors.muted,
    },
    divider: brandColors.borderSubtle,
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 14,
        },
        containedPrimary: {
          color: brandColors.white,
          background: brandGradients.primary,
          boxShadow: brandShadows.primary,
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
          "&:hover": {
            background: brandGradients.primary,
            boxShadow: brandShadows.primaryHover,
            transform: "translateY(-2px)",
          },
        },
        outlinedPrimary: {
          color: brandColors.blueDark,
          borderColor: "rgba(43, 111, 150, 0.18)",
          background: brandColors.glassBgSecondary,
          borderWidth: 1.5,
          transition: "transform 0.18s ease, background 0.18s ease",
          "&:hover": {
            background: brandColors.white,
            borderColor: "rgba(43, 111, 150, 0.18)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
