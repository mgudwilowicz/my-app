import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { fetchFamilyOverview } from "../../api/families";
import { useUserContext } from "../../context/UserContext";
import { useAuthFetch } from "../../hooks/useAuthFetch";
import { useFamilyRole } from "../../hooks/useFamilyRole";
import type { FamilyOverviewData } from "@appTypes/FamilyOverview";
import { getDashboardDateBounds } from "@appTypes/DailyLog";
import PageHeader from "../PageHeader";
import { outlinedCardSx, pageToolbarSx } from "../../theme/pageStyles";
import FamilyMemberStatusCard from "./FamilyMemberStatusCard";
import FamilyOverviewMetrics from "./FamilyOverviewMetrics";

type FamilyOverviewProps = {
  familyId: number;
  familyName: string;
};

export default function FamilyOverview({
  familyId,
  familyName,
}: FamilyOverviewProps) {
  const { currentUser } = useUserContext();
  const authFetch = useAuthFetch();
  const { isAdmin } = useFamilyRole();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<FamilyOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const date = getDashboardDateBounds().today;
      const data = await fetchFamilyOverview(authFetch, familyId, date);
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [authFetch, familyId]);

  useEffect(() => {
    if (currentUser) {
      loadOverview();
    }
  }, [currentUser, loadOverview]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  if (!overview) {
    return null;
  }

  return (
    <Box>
      <Box sx={pageToolbarSx}>
        <PageHeader
          sx={{ mb: 0 }}
          title="Family overview"
          subtitle={`Today's compliance for all ${familyName} members`}
        />

        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<GroupAddIcon />}
            onClick={() => navigate("/members")}
            sx={{ flexShrink: 0 }}
          >
            Manage members
          </Button>
        )}
      </Box>

      <FamilyOverviewMetrics summary={overview.summary} />

      <Card
        variant="outlined"
        sx={{
          ...outlinedCardSx,
          p: { xs: 2, sm: 2.25 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "text.primary", fontSize: 14 }}
          >
            Member status — today
          </Typography>
          {isAdmin && (
            <Chip
              label="Admin view"
              size="small"
              color="info"
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          )}
        </Box>

        {overview.members.map((member, index) => (
          <FamilyMemberStatusCard
            key={member.id}
            member={member}
            index={index}
            isCurrentUser={member.id === currentUser?.id}
          />
        ))}
      </Card>
    </Box>
  );
}
