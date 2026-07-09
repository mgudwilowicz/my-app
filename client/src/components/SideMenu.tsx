import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useState } from "react";
import { useUserContext } from "../context/UserContext";
import * as React from "react";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useFamilyContext } from "../context/FamilyContext";
import { useFamilyRole } from "../hooks/useFamilyRole";
import { getAvatarColor, getDisplayName, getMemberInitials } from "../utils/familyOverview";

const DRAWER_WIDTH = 250;

const drawerPaperSx = {
  width: DRAWER_WIDTH,
  boxSizing: "border-box" as const,
  overflow: "hidden",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
    width: 0,
    height: 0,
  },
};

type SideMenuProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export default function SideMenu({
  mobileOpen = false,
  onMobileClose,
}: SideMenuProps) {
  const { currentUser, logout } = useUserContext();
  const { families, activeFamily, activeFamilyId, setActiveFamilyId, loading: familiesLoading } =
    useFamilyContext();
  const { isAdmin } = useFamilyRole();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleFamilyChange = (event: SelectChangeEvent<number>) => {
    setActiveFamilyId(Number(event.target.value));
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onMobileClose?.();
  };

  const drawerUserLabel = currentUser
    ? getDisplayName(currentUser)
    : "User";
  const drawerUserInitials = currentUser
    ? getMemberInitials(currentUser)
    : "U";
  const userAvatarColor = getAvatarColor(currentUser?.id ?? 0);

  const listSubheaderSx = {
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "text.disabled",
    lineHeight: 1.4,
  };

  const navItemTextSlotProps = {
    primary: { noWrap: true, sx: { fontWeight: 600, fontSize: 13 } },
  };

  const drawerList = (
    <Stack
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ minWidth: 0, overflow: "hidden" }}>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: 20,
            color: "text.primary",
            px: 2,
            pt: 2,
            pb: 0.5,
          }}
        >
          MedAlert
        </Typography>
        {!familiesLoading && families.length > 1 ? (
          <FormControl
            size="small"
            sx={{ px: 2, mb: 1, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
          >
            <Select<number>
              value={activeFamilyId ?? ""}
              onChange={handleFamilyChange}
              displayEmpty
            >
              {families.map((family) => (
                <MenuItem key={family.id} value={family.id}>
                  {family.name} ({family.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Typography
            variant="caption"
            noWrap
            component="div"
            sx={{
              px: 2,
              mb: 1,
              color: "text.disabled",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {activeFamily?.name ?? "No family"}
          </Typography>
        )}
        <Divider sx={{ margin: "12px 0" }} />

        <List
          subheader={
            <ListSubheader component="div" sx={listSubheaderSx}>
              Main
            </ListSubheader>
          }
        >
          <ListItem key={"Dashboard"} disablePadding>
            <ListItemButton onClick={() => handleNavigate("/dashboard")}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary={"Dashboard"} slotProps={navItemTextSlotProps} />
            </ListItemButton>
          </ListItem>
          <ListItem key={"Family"} disablePadding>
            <ListItemButton onClick={() => handleNavigate("/families")}>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary={"Family"} slotProps={navItemTextSlotProps} />
            </ListItemButton>
          </ListItem>
          <ListItem key={"Medications"} disablePadding>
            <ListItemButton onClick={() => handleNavigate("/medications")}>
              <ListItemIcon>
                <MedicalInformationIcon />
              </ListItemIcon>
              <ListItemText primary={"Medications"} slotProps={navItemTextSlotProps} />
            </ListItemButton>
          </ListItem>
          <ListItem key={"Reports"} disablePadding>
            <ListItemButton onClick={() => handleNavigate("/reports")}>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary={"Reports"} slotProps={navItemTextSlotProps} />
            </ListItemButton>
          </ListItem>
        </List>

        {isAdmin && (
          <List
            subheader={
              <ListSubheader component="div" sx={listSubheaderSx}>
                Admin
              </ListSubheader>
            }
          >
            <ListItem key={"Members"} disablePadding>
              <ListItemButton onClick={() => handleNavigate("/members")}>
                <ListItemIcon>
                  <GroupAddIcon />
                </ListItemIcon>
                <ListItemText primary={"Members"} slotProps={navItemTextSlotProps} />
              </ListItemButton>
            </ListItem>
          </List>
        )}

        <List
          subheader={
            <ListSubheader component="div" sx={listSubheaderSx}>
              Account
            </ListSubheader>
          }
        >
          <ListItem key={"Profile settings"} disablePadding>
            <ListItemButton onClick={() => handleNavigate("/profile-settings")}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText
                primary={"Profile settings"}
                slotProps={navItemTextSlotProps}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Box sx={{ minWidth: 0, overflow: "hidden", flexShrink: 0, px: 1.5, pb: 1.5 }}>
        {currentUser && (
          <>
            <Box
              component="button"
              type="button"
              id="sidebar-user-button"
              aria-controls={open ? "sidebar-user-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleAvatarClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                width: "100%",
                p: 1,
                border: "none",
                bgcolor: "transparent",
                cursor: "pointer",
                minWidth: 0,
                textAlign: "left",
                font: "inherit",
                color: "inherit",
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: 14,
                  fontWeight: 700,
                  bgcolor: userAvatarColor.bgcolor,
                  color: userAvatarColor.color,
                  flexShrink: 0,
                }}
              >
                {drawerUserInitials}
              </Avatar>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontWeight: 700,
                  color: "text.primary",
                  fontSize: 13,
                }}
              >
                {drawerUserLabel}
              </Typography>
            </Box>
            <Menu
              id="sidebar-user-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleNavigate("/profile-settings")}>
                Profile
              </MenuItem>
              <MenuItem onClick={() => logout()}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Box>
    </Stack>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": drawerPaperSx,
        }}
      >
        {drawerList}
      </Drawer>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          overflow: "hidden",
          "& .MuiDrawer-paper": drawerPaperSx,
        }}
        open
      >
        {drawerList}
      </Drawer>
    </>
  );
}
