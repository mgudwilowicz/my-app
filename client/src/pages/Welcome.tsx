import Box from "@mui/material/Box";
import { Navigate } from "react-router";
import PillCanvasBackground from "../components/welcome/PillCanvasBackground";
import WelcomeHero from "../components/welcome/WelcomeHero";
import { welcomePageSx } from "../components/welcome/welcomeStyles";
import { useUserContext } from "../context/UserContext";

function Welcome() {
  const { currentUser } = useUserContext();

  if (currentUser) {
    return <Navigate to="/families" replace />;
  }

  return (
    <Box sx={welcomePageSx.root}>
      <PillCanvasBackground />
      <WelcomeHero />
    </Box>
  );
}

export default Welcome;
