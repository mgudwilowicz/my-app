import MenuIcon from "@mui/icons-material/Menu";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotificationsIcon from "@mui/icons-material/Notifications";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

type HeaderProps = {
  onMenuClick?: () => void;
};

function Header({ onMenuClick }: HeaderProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        p: 1,
        mb: { xs: 2, sm: 4 },
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {onMenuClick && (
        <IconButton
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          sx={{ display: { xs: "inline-flex", md: "none" }, mr: 0.5 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Stack direction="row" spacing={0.5} sx={{ ml: "auto" }}>
        <IconButton>
          <CalendarMonthIcon />
        </IconButton>
        <IconButton>
          <NotificationsIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}

export default Header;
