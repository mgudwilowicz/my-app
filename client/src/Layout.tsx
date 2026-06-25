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

  return (
    <Box sx={{ display: "flex" }}>
      {currentUser && !isPublicPage && <SideMenu />}
      <Box
        sx={{
          marginLeft: currentUser && !isPublicPage ? "250px" : "0",
          width: "100%",
        }}
      >
        {!isPublicPage && <Header />}
        <App />
      </Box>
    </Box>
  );
}
