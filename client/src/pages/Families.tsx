import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import { useFamilyContext } from "../context/FamilyContext";
import { type Family as FamilyType } from "@appTypes/Family";
import PageHeader from "../components/PageHeader";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

import { useAuthFetch } from "@/hooks/useAuthFetch";
import Family from "../components/Family";

function Families() {
  const { currentUser } = useUserContext();
  const { families, loading, refreshFamilies, setActiveFamilyId } =
    useFamilyContext();
  const authFetch = useAuthFetch();

  const [creating, setCreating] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      refreshFamilies();
    }
  }, [currentUser, refreshFamilies]);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = familyName.trim();
    if (!trimmedName) {
      setError("Please enter a family name");
      return;
    }
    if (trimmedName.length < 3) {
      setError("Family name must be at least 3 characters long");
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
      await refreshFamilies();
      setActiveFamilyId(data.id);
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
    <Box sx={{ p: { xs: 2, sm: 3.5 }, maxWidth: 960 }}>
      <PageHeader
        title={hasFamily ? "Your families" : "Create your family"}
        subtitle={
          hasFamily
            ? "Create a new family or join others as a member via invitation."
            : "Create a family to start tracking medicines together."
        }
      />

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

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: "divider",
          boxShadow: "none",
          p: { xs: 2, sm: 2.25 },
          mb: hasFamily ? 2 : 0,
        }}
      >
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
            autoFocus={!hasFamily}
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
            {creating ? "Creating…" : hasFamily ? "Create another family" : "Create family"}
          </Button>
        </Box>
      </Card>

      {hasFamily && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {families.map((family: FamilyType) => (
            <Family key={family.id} family={family} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default Families;
