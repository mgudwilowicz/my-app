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
import { useFamilyContext } from "../context/FamilyContext";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { fetchInvitePreview, type InvitePreview } from "../api/invite";

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { currentUser, token: accessToken } = useUserContext();
  const { refreshFamilies, setActiveFamilyId } = useFamilyContext();
  const authFetch = useAuthFetch();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);

  async function finalizeInvite(
    token: string,
  ): Promise<{ familyId: number; familyName: string; role: string }> {
    const response = await authFetch(`/families/finalize-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Could not join family");
    }
    return data;
  }

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
          setAlreadyMember(
            families.some((f: { id: number }) => f.id === previewData.familyId),
          );
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
      const result = await finalizeInvite(token);
      await refreshFamilies();
      setActiveFamilyId(result.familyId);
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

  if (alreadyMember) {
    return (
      <Box sx={{ maxWidth: 480, mx: "auto", mt: 4, px: 2 }}>
        <Typography variant="h5" gutterBottom>
          You are already a member of this family
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => {
            setActiveFamilyId(preview.familyId);
            navigate("/families");
          }}
        >
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
        You were invited as <strong>{preview.email}</strong>. You will join as a
        member.
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
