import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";
import { brandGradients } from "../../theme/tokens";
import { pageHeaderStyles } from "../../theme/pageStyles";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: brandGradients.background,
        p: 2,
      }}
    >
      <IconButton
        component={Link}
        to="/"
        aria-label="Back to home"
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "text.primary",
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            ...pageHeaderStyles.title,
            mb: subtitle ? 0.5 : 2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{ ...pageHeaderStyles.subtitle, mb: 3 }}
          >
            {subtitle}
          </Typography>
        )}
        {children}
      </Paper>
    </Box>
  );
}

export default AuthLayout;
