import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useUserContext } from "../context/UserContext";
import {
  fetchInvitePreview,
  finalizeInvite,
  type InvitePreview,
} from "../api/invite";

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { currentUser, token: accessToken } = useUserContext();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadError("Invitation link is invalid");
      setLoading(false);
      return;
    }

    fetchInvitePreview(token)
      .then(setPreview)
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Invalid invitation"),
      )
      .finally(() => setLoading(false));
  }, [token]);

  const handleJoin = async () => {
    if (!token || !accessToken) return;
    setJoining(true);
    setActionError(null);
    try {
      await finalizeInvite(token, accessToken);
      navigate("/");
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

  const registerTo = `/register?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(preview.email)}`;
  const loginTo = `/login?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(preview.email)}`;

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

      {currentUser ? (
        emailMatches ? (
          <Button
            variant="contained"
            onClick={handleJoin}
            disabled={joining}
          >
            {joining ? "Joining…" : "Join family"}
          </Button>
        ) : (
          <Alert severity="warning">
            Logged in as {currentUser.email}. Log out and sign in with{" "}
            {preview.email} to accept this invitation.
          </Alert>
        )
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button variant="contained" component={Link} to={registerTo}>
            Create account
          </Button>
          <Button variant="outlined" component={Link} to={loginTo}>
            I already have an account
          </Button>
        </Box>
      )}
    </Box>
  );
}
