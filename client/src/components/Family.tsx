import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  Chip,
  List,
  Typography,
  Button,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useUserContext } from "../context/UserContext";
import { type Family as FamilyType } from "@appTypes/Family";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export default function Family({ family }: { family: FamilyType }) {
  const authFetch = useAuthFetch();
  const { currentUser } = useUserContext();
  const [familyData, setFamilyData] = useState<FamilyType | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  const loadFamily = async () => {
    try {
      const response = await authFetch(`/families/${family.id}`);
      if (!response.ok) throw new Error("Failed to load family");
      const data = await response.json();
      setFamilyData(data);
    } catch (err) {
      alert(err);
    }
  };

  useEffect(() => {
    if (currentUser) loadFamily();
  }, [currentUser, family.id, authFetch]);

  const myRole = familyData?.members?.find((m) => m.id === currentUser?.id)
    ?.role;
  const isAdmin = myRole === "admin";

  const handleInvite = async () => {
    setInviteError(null);
    setInviteSuccess(null);
    setInviting(true);
    try {
      const response = await authFetch(`/families/${family.id}/invite`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Invite failed");
      }
      setInviteSuccess(`Invitation sent to ${data.email}`);
      setInviteEmail("");
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: "divider",
          boxShadow: "none",
          p: { xs: 2, sm: 2.25 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: 16, color: "text.primary" }}
            >
              {family.name}
            </Typography>
            {family.role && (
              <Chip
                label={family.role}
                size="small"
                color={family.role === "admin" ? "primary" : "default"}
              />
            )}
          </Box>

          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => {
                setInviteOpen(true);
                setInviteSuccess(null);
                setInviteError(null);
              }}
            >
              Invite
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <List dense disablePadding>
          {familyData?.members?.map((member) => (
            <ListItem key={member.id} disablePadding sx={{ py: 0.5 }}>
              <ListItemText
                primary={member.email}
                secondary={member.role}
                slotProps={{
                  primary: { sx: { fontSize: 14 } },
                  secondary: { sx: { fontSize: 12 } },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Card>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)}>
        <DialogTitle>Invite member</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1, minWidth: 320 }}>
          {inviteError && <Alert severity="error">{inviteError}</Alert>}
          {inviteSuccess && <Alert severity="success">{inviteSuccess}</Alert>}
          <TextField
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
          >
            {inviting ? "Sending…" : "Send invite"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
