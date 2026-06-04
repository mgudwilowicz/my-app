import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { Navigate } from "react-router";
import { useUserContext } from "../context/UserContext";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { useFamilyRole } from "../hooks/useFamilyRole";
import type { Family, FamilyMember } from "@appTypes/Family";
import type { PendingInvitation } from "@appTypes/Invitation";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function Members() {
  const { currentUser } = useUserContext();
  const authFetch = useAuthFetch();
  const { isAdmin, loading: roleLoading } = useFamilyRole();

  const [family, setFamily] = useState<Family | null>(null);
  const [pending, setPending] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const [removeTarget, setRemoveTarget] = useState<FamilyMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const listRes = await authFetch("/families");
      if (!listRes.ok) throw new Error("Failed to load family");
      const families: Family[] = await listRes.json();
      if (!families.length) {
        setFamily(null);
        setPending([]);
        return;
      }

      const familyId = families[0].id;
      const [detailRes, pendingRes] = await Promise.all([
        authFetch(`/families/${familyId}`),
        authFetch(`/families/${familyId}/invitations`),
      ]);

      if (!detailRes.ok) throw new Error("Failed to load family");
      const familyData: Family = await detailRes.json();
      setFamily(familyData);

      if (pendingRes.ok) {
        setPending(await pendingRes.json());
      } else if (pendingRes.status === 403) {
        setPending([]);
      } else {
        throw new Error("Failed to load invitations");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (currentUser && isAdmin) loadData();
  }, [currentUser, isAdmin, loadData]);

  const handleInvite = async () => {
    if (!family) return;
    setInviting(true);
    setInviteLink(null);
    setError(null);
    try {
      const res = await authFetch(`/families/${family.id}/invite`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invite failed");
      setInviteEmail("");
      setInviteLink(data.inviteLink);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!family || !removeTarget) return;
    setRemoving(true);
    try {
      const res = await authFetch(
        `/families/${family.id}/members/${removeTarget.id}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Remove failed");
      setRemoveTarget(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setRemoving(false);
    }
  };

  const handleCancelInvite = async (invitationId: number) => {
    if (!family) return;
    try {
      const res = await authFetch(
        `/families/${family.id}/invitations/${invitationId}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancel failed");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  if (roleLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/families" replace />;
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!family) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Create a family first to manage members.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 720 }}>
      <Typography variant="h4" gutterBottom>
        Family members
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage who is in {family.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Invite by email
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            They will get a link to register and join this family.
          </Typography>
          {inviteLink && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Invitation link (copy and send):
              <Typography variant="body2" sx={{ wordBreak: "break-all", mt: 1 }}>
                {inviteLink}
              </Typography>
            </Alert>
          )}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <TextField
              size="small"
              type="email"
              label="Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <Button
              variant="contained"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting ? "Sending…" : "Send invite"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Current members ({family.members?.length ?? 0})
          </Typography>
          <Box>
            {family.members?.map((member, index) => (
              <Box key={member.id}>
                {index > 0 && <Divider />}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography variant="body1">{member.email}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Joined{" "}
                      {member.created_at
                        ? formatDate(member.created_at)
                        : "—"}
                    </Typography>
                  </Box>
                  <Chip
                    label={member.role}
                    size="small"
                    color={member.role === "admin" ? "primary" : "default"}
                  />
                  {member.role === "member" && (
                    <Button
                      color="error"
                      size="small"
                      onClick={() => setRemoveTarget(member)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Pending invitations ({pending.length})
          </Typography>
          {pending.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No pending invitations.
            </Typography>
          ) : (
            <Box>
              {pending.map((inv, index) => (
                <Box key={inv.id}>
                  {index > 0 && <Divider />}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 180 }}>
                      <Typography variant="body1">{inv.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Invited {formatDate(inv.created_at)} · expires in{" "}
                        {daysUntil(inv.expires_at)} day(s)
                      </Typography>
                    </Box>
                    <Chip label="Pending" size="small" color="warning" />
                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleCancelInvite(inv.id)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(removeTarget)} onClose={() => setRemoveTarget(null)}>
        <DialogTitle>Remove member?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remove {removeTarget?.email} from {family.name}? They will lose access
            to this family.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRemoveMember}
            disabled={removing}
          >
            {removing ? "Removing…" : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
