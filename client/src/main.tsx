import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { UserProvider } from "./context/UserProvider";
import { FamilyProvider } from "./context/FamilyProvider";
import { BrowserRouter } from "react-router";
import { AppThemeProvider } from "./theme/ThemeProvider";
import { MainLayout } from "./Layout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <BrowserRouter>
        <UserProvider>
          <FamilyProvider>
            <MainLayout />
          </FamilyProvider>
        </UserProvider>
      </BrowserRouter>
    </AppThemeProvider>
  </StrictMode>,
);
