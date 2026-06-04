import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useUserContext } from "../context/UserContext";
import { useAuthFetch } from "../hooks/useAuthFetch";
import {
  fetchInvitePreview,
  finalizeInvite,
  type InvitePreview,
} from "../api/invite";

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { currentUser, token: accessToken } = useUserContext();
  const authFetch = useAuthFetch();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasFamily, setHasFamily] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setLoadError("Invitation link is invalid");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [previewData, familiesRes] = await Promise.all([
          fetchInvitePreview(token!),
          authFetch("/families"),
        ]);

        if (cancelled) return;

        setPreview(previewData);

        if (familiesRes.ok) {
          const families = await familiesRes.json();
          setHasFamily(families.length > 0);
        } else {
          setHasFamily(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Invalid invitation",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token, authFetch]);

  const handleJoin = async () => {
    if (!token || !accessToken) return;
    setJoining(true);
    setActionError(null);
    try {
      await finalizeInvite(token, accessToken);
      navigate("/families");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not join family",
      );
    } finally {
      setJoining(false);
    }
  };

  const emailMatches =
    preview &&
    currentUser &&
    currentUser.email.trim().toLowerCase() ===
      preview.email.trim().toLowerCase();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ maxWidth: 480, mx: "auto", mt: 4, px: 2 }}>
        <Alert severity="error">{loadError}</Alert>
      </Box>
    );
  }

  if (!preview || !token) {
    return null;
  }

  if (hasFamily) {
    return (
      <Box sx={{ maxWidth: 480, mx: "auto", mt: 4, px: 2 }}>
        <Typography variant="h5" gutterBottom>
          You already belong to a family
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          You can only belong to one family. Go to your family overview to manage
          members.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/families")}>
          Go to family
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h5" gutterBottom>
        Join {preview.familyName}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        You were invited as <strong>{preview.email}</strong>.
      </Typography>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {emailMatches ? (
        <Button variant="contained" onClick={handleJoin} disabled={joining}>
          {joining ? "Joining…" : "Join family"}
        </Button>
      ) : (
        <Alert severity="warning">
          Logged in as {currentUser?.email}. Log out and sign in with{" "}
          {preview.email} to accept this invitation.
        </Alert>
      )}
    </Box>
  );
}
