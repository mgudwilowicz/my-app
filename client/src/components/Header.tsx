import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useUserContext } from "../context/UserContext";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import { Menu, MenuItem } from "@mui/material";

function Header() {
  const { currentUser, logout } = useUserContext();

  const getInitials = (email: string | undefined) => {
    if (!email) return "User";
    const namePart = email.split("@")[0];
    return namePart.substring(0, 2).toUpperCase();
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("🚀 ~ handleClick ~ event:", event.currentTarget);

    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack
      sx={{
        width: "100%",
        bgcolor: "primary.main",
        color: "white",
        p: 2,
        mb: 4,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      <Typography sx={{ width: "max-content" }} variant="h4">
        MedAlert
      </Typography>

      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Avatar
          sx={{ width: 40, height: 40 }}
          children={getInitials(currentUser?.email)}
        />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={() => logout()}>Logout</MenuItem>
      </Menu>
    </Stack>
  );
}

export default Header;
