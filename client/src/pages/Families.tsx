import React, { useCallback, useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import { type Family as FamilyType } from "@appTypes/Family";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

import { useAuthFetch } from "@/hooks/useAuthFetch";
import Family from "../components/Family";

function Families() {
  const { currentUser } = useUserContext();
  const authFetch = useAuthFetch();

  const [families, setFamilies] = useState<FamilyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadFamilies = useCallback(async () => {
    setError(null);
    try {
      const response = await authFetch(`/families`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load families");
      }
      const data = await response.json();
      setFamilies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load families");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (currentUser) {
      loadFamilies();
    }
  }, [currentUser, loadFamilies]);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = familyName.trim();
    if (!trimmedName) {
      setError("Please enter a family name");
      return;
    }

    setCreating(true);
    try {
      const response = await authFetch(`/families`, {
        method: "POST",
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to create family");
      }

      setFamilyName("");
      setSuccess(`Family "${data.name}" created successfully`);
      await loadFamilies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create family");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasFamily = families.length > 0;

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {hasFamily ? "Your family" : "Create your family"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {hasFamily
          ? "Manage your family group and invite members."
          : "You are not in a family yet. Create one to start tracking medicines together."}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {!hasFamily && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              component="form"
              onSubmit={handleCreateFamily}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Family name"
                placeholder="e.g. Smith family"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                disabled={creating}
                fullWidth
                autoFocus
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  creating ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <GroupAddIcon />
                  )
                }
                disabled={creating || !familyName.trim()}
                sx={{ alignSelf: "flex-start" }}
              >
                {creating ? "Creating…" : "Create family"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {hasFamily && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {families.map((family) => (
            <Family key={family.id} family={family} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default Families;
