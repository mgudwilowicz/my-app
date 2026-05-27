import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { UserProvider } from "./context/UserProvider";
import { BrowserRouter } from "react-router";
import { AppThemeProvider } from "./theme/ThemeProvider";
import { MainLayout } from "./Layout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <BrowserRouter>
        <UserProvider>
          <MainLayout />
        </UserProvider>
      </BrowserRouter>
    </AppThemeProvider>
  </StrictMode>,
);
