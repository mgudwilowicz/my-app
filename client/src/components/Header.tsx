import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotificationsIcon from "@mui/icons-material/Notifications";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

function Header() {
  return (
    <Stack
      sx={{
        p: 1,
        mb: 4,
        justifyContent: "flex-end",
        alignItems: "center",
        flexDirection: "row",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={0.5}>
        <IconButton >
          <CalendarMonthIcon />
        </IconButton>
        <IconButton >
          <NotificationsIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}

export default Header;
