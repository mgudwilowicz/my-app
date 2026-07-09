import { useState } from "react";
import Box from "@mui/material/Box";
import { useLocation } from "react-router";
import { useUserContext } from "./context/UserContext";
import SideMenu from "./components/SideMenu.tsx";
import Header from "./components/Header";
import App from "./App.tsx";

export function MainLayout() {
  const { currentUser } = useUserContext();
  const { pathname } = useLocation();
  const isPublicPage = ["/", "/login", "/register"].includes(pathname);
  const showSideMenu = Boolean(currentUser && !isPublicPage);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      {showSideMenu && (
        <SideMenu
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
      )}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {!isPublicPage && (
          <Header
            onMenuClick={showSideMenu ? () => setMobileOpen(true) : undefined}
          />
        )}
        <App />
      </Box>
    </Box>
  );
}
