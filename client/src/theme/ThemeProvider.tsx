import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./muiTheme";
import type { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
