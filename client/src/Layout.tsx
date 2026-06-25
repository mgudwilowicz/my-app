import Box from "@mui/material/Box";
import { useLocation } from "react-router";
import { useUserContext } from "./context/UserContext";
import SideMenu from "./components/SideMenu.tsx";
import Header from "./components/Header";
import App from "./App.tsx";

export function MainLayout() {
  const { currentUser } = useUserContext();
  const { pathname } = useLocation();
  const isWelcomePage = pathname === "/";

  return (
    <Box sx={{ display: "flex" }}>
      {currentUser && !isWelcomePage && <SideMenu />}
      <Box
        sx={{
          marginLeft: currentUser && !isWelcomePage ? "250px" : "0",
          width: "100%",
        }}
      >
        {!isWelcomePage && <Header />}
        <App />
      </Box>
    </Box>
  );
}
