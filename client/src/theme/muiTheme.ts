import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4f6ef7",
      light: "#eef1fe",
      dark: "#3451d1",
    },
    success: {
      main: "#1aaa6e",
      light: "#d6f5e9",
      dark: "#0a6642",
    },
    warning: {
      main: "#c87a00",
      light: "#fff3cc",
      dark: "#7a4a00",
    },
    error: {
      main: "#d43535",
      light: "#fde8e8",
      dark: "#8b1a1a",
    },
    info: {
      main: "#ddeeff",
      contrastText: "#0a3d7a",
    },
    background: {
      default: "#f0f2f8",
      paper: "#fff",
    },
    text: {
      primary: "#1a1a2e",
      secondary: "#44475a",
      disabled: "#6b6e85",
    },
    divider: "#c8cad8",
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
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
  },
});

export default theme;
