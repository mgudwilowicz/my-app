import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  List,
  Typography,
  CardActions,
  CardContent,
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
  const [inviteLink, setInviteLink] = useState<string | null>(null);
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
    setInviteLink(null);
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
      setInviteLink(data.inviteLink);
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
        sx={{
          width: 300,
          borderRadius: 3,
          boxShadow: 3,
          p: 1,
          m: 2,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
            {family.name}
          </Typography>

          <Divider sx={{ mb: 1 }} />

          <List dense>
            {familyData?.members?.map((member) => (
              <ListItem key={member.id} disablePadding>
                <ListItemText
                  primary={member.email}
                  secondary={member.role}
                  slotProps={{ primary: { sx: { fontSize: 14 } } }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>

        {isAdmin && (
          <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => {
                setInviteOpen(true);
                setInviteLink(null);
                setInviteError(null);
              }}
            >
              Invite
            </Button>
          </CardActions>
        )}
      </Card>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)}>
        <DialogTitle>Invite member</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1, minWidth: 320 }}>
          {inviteError && <Alert severity="error">{inviteError}</Alert>}
          {inviteLink && (
            <Alert severity="success">
              Invitation link (copy and send):<br />
              <Typography variant="body2" sx={{ wordBreak: "break-all", mt: 1 }}>
                {inviteLink}
              </Typography>
            </Alert>
          )}
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
