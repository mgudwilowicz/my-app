import Box from "@mui/material/Box";
import { useUserContext } from "./context/UserContext";
import SideMenu from "./components/SideMenu.tsx";
import Header from "./components/Header";
import App from "./App.tsx";

export function MainLayout() {
  const { currentUser } = useUserContext();

  return (
    <Box sx={{ display: "flex" }}>
      {currentUser && <SideMenu />}
      <Box sx={{ marginLeft: currentUser ? "250px" : "0", width: "100%" }}>
        <Header />
        <App />
      </Box>
    </Box>
  );
}
