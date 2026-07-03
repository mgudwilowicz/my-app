import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router";
import { welcomeColors } from "./welcomeStyles";

function WelcomeHero() {
  return (
    <>
      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          top: 26,
          left: 26,
          zIndex: 10,
          display: "flex",
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            background: welcomeColors.statBg,
            backdropFilter: "blur(6px)",
            border: `1px solid ${welcomeColors.statBorder}`,
            borderRadius: "12px",
            px: "14px",
            py: "8px",
            fontSize: "12px",
            color: welcomeColors.statText,
            fontWeight: 600,
          }}
        >
          <Box
            component="span"
            sx={{ color: welcomeColors.statValue, fontSize: "14px", fontWeight: 700 }}
          >
            100+
          </Box>{" "}
          medications supported
        </Box>
        <Box
          sx={{
            background: welcomeColors.statBg,
            backdropFilter: "blur(6px)",
            border: `1px solid ${welcomeColors.statBorder}`,
            borderRadius: "12px",
            px: "14px",
            py: "8px",
            fontSize: "12px",
            color: welcomeColors.statText,
            fontWeight: 600,
          }}
        >
          <Box
            component="span"
            sx={{ color: welcomeColors.statValue, fontSize: "14px", fontWeight: 700 }}
          >
            24/7
          </Box>{" "}
          reminders
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          pointerEvents: "none",
          px: "20px",
        }}
      >
        <Box
          sx={{
            pointerEvents: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: welcomeColors.badgeBg,
            backdropFilter: "blur(8px)",
            border: `1px solid ${welcomeColors.badgeBorder}`,
            color: welcomeColors.badgeText,
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.3px",
            px: "16px",
            py: "7px",
            borderRadius: "999px",
            mb: "22px",
            boxShadow: "0 4px 14px rgba(91,156,214,0.08)",
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: welcomeColors.dot,
              boxShadow: `0 0 0 3px ${welcomeColors.dotGlow}`,
            }}
          />
          Your medications, under control
        </Box>

        <Typography
          component="h1"
          sx={{
            fontSize: "clamp(34px, 6vw, 60px)",
            fontWeight: 800,
            color: welcomeColors.headline,
            lineHeight: 1.08,
            letterSpacing: "-1px",
            mb: "16px",
          }}
        >
          Manage{" "}
          <Box
            component="span"
            sx={{
              background: welcomeColors.headlineAccent,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            medications
          </Box>{" "}
          effortlessly
        </Typography>

        <Typography
          sx={{
            fontSize: "clamp(15px, 2vw, 19px)",
            color: welcomeColors.subtitle,
            maxWidth: "540px",
            lineHeight: 1.55,
            mb: "34px",
          }}
        >
          Dose reminders, intake history, and full control over your therapy — all
          in one place.
        </Typography>

        <Box
          sx={{
            pointerEvents: "auto",
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            color="primary"
            disableElevation
            sx={{ fontSize: "15px", px: "30px", py: "14px" }}
          >
            Log in
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            variant="outlined"
            color="primary"
            sx={{ fontSize: "15px", px: "30px", py: "14px" }}
          >
            Create account
          </Button>
        </Box>
      </Box>

      <Typography
        sx={{
          position: "absolute",
          bottom: 22,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: "12.5px",
          color: welcomeColors.hint,
          zIndex: 10,
          pointerEvents: "none",
          letterSpacing: "0.2px",
        }}
      >
        Move your cursor — pills react to your movement
      </Typography>
    </>
  );
}

export default WelcomeHero;
