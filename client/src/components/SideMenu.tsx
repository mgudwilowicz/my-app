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
import Button from "@mui/material/Button";
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
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useFamilyContext } from "../context/FamilyContext";
import { useFamilyRole } from "../hooks/useFamilyRole";

export default function SideMenu() {
  const { currentUser, logout } = useUserContext();
  const { families, activeFamily, activeFamilyId, setActiveFamilyId, loading: familiesLoading } =
    useFamilyContext();
  const { isAdmin } = useFamilyRole();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleFamilyChange = (event: SelectChangeEvent<number>) => {
    setActiveFamilyId(Number(event.target.value));
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "";

  const DrawerList = (
    <Stack
      sx={{
        width: 250,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography
          variant="h6"
          noWrap
          component="div"
          color="primary"
          sx={{ padding: "16px 16px 4px 16px" }}
        >
          MedAlert
        </Typography>
        {!familiesLoading && families.length > 1 ? (
          <FormControl size="small" sx={{ px: 2, mb: 1, width: "calc(100% - 32px)" }}>
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
            variant="body2"
            noWrap
            component="div"
            sx={{ paddingInline: "16px", mb: 1 }}
          >
            {activeFamily?.name ?? "No family"}
          </Typography>
        )}
        <Divider sx={{ margin: "12px 0" }} />

        <List subheader={<ListSubheader component="div">Main</ListSubheader>}>
          <ListItem key={"Dashboard"} disablePadding>
            <ListItemButton onClick={() => navigate("/dashboard")}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary={"Dashboard"} />
            </ListItemButton>
          </ListItem>
          <ListItem key={"Family"} disablePadding>
            <ListItemButton onClick={() => navigate("/families")}>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary={"Family"} />
            </ListItemButton>
          </ListItem>
          <ListItem key={"Medications"} disablePadding>
            <ListItemButton onClick={() => navigate("/medications")}>
              <ListItemIcon>
                <MedicalInformationIcon />
              </ListItemIcon>
              <ListItemText primary={"Medications"} />
            </ListItemButton>
          </ListItem>
          <ListItem key={"Reports"} disablePadding>
            <ListItemButton onClick={() => navigate("/reports")}>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary={"Reports"} />
            </ListItemButton>
          </ListItem>
        </List>

        {isAdmin && (
          <List subheader={<ListSubheader component="div">Admin</ListSubheader>}>
            <ListItem key={"Members"} disablePadding>
              <ListItemButton onClick={() => navigate("/members")}>
                <ListItemIcon>
                  <GroupAddIcon />
                </ListItemIcon>
                <ListItemText primary={"Members"} />
              </ListItemButton>
            </ListItem>
          </List>
        )}

        <List
          subheader={<ListSubheader component="div">Account</ListSubheader>}
        >
          <ListItem key={"Profile settings"} disablePadding>
            <ListItemButton onClick={() => navigate("/profile-settings")}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary={"Profile settings"} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Box>
        <Divider sx={{ margin: "16px 0" }} />
        {currentUser && (
          <Box sx={{}}>
            <Box sx={{ display: "flex", padding: "8px" }}>
              <Button
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleAvatarClick}
              >
                <Avatar sx={{ width: 25, height: 25, marginRight: 2 }}>
                  {getInitials(currentUser?.name || "User")}
                </Avatar>
                <Typography
                  variant="body1"
                  sx={{ color: theme.palette.text.disabled }}
                >
                  {currentUser.name || "User"}
                </Typography>
              </Button>
            </Box>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={() => logout()}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Box>
    </Stack>
  );

  return (
    <Drawer variant="permanent" anchor="left">
      {DrawerList}
    </Drawer>
  );
}
