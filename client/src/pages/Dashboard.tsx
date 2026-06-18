import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { fetchDashboard, upsertLog } from "../api/logs";
import DashboardChecklistCard from "../components/dashboard/DashboardChecklistCard";
import DateNav from "../components/dashboard/DateNav";
import DashboardMetricsBar from "../components/dashboard/DashboardMetrics";
import { useUserContext } from "../context/UserContext";
import { useFamilyContext } from "../context/FamilyContext";
import { useAuthFetch } from "../hooks/useAuthFetch";
import {
  computeMetrics,
  formatDashboardDate,
  getDashboardDateBounds,
  getPendingSlotsLabel,
  getTimeGreeting,
  isDateInDashboardRange,
  type DashboardData,
} from "@appTypes/DailyLog";
import type { MedicineSlot } from "@appTypes/Medicine";

export default function Dashboard() {
  const { currentUser } = useUserContext();
  const authFetch = useAuthFetch();
  const { activeFamilyId, loading: familiesLoading } = useFamilyContext();

  const [selectedDate, setSelectedDate] = useState(
    () => getDashboardDateBounds().today,
  );
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!activeFamilyId) {
      setDashboard(null);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await fetchDashboard(authFetch, activeFamilyId, selectedDate);
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [authFetch, activeFamilyId, selectedDate]);

  useEffect(() => {
    if (currentUser) {
      loadDashboard();
    }
  }, [currentUser, loadDashboard]);

  const pendingSubtitle = useMemo(
    () => (dashboard ? getPendingSlotsLabel(dashboard.slots) : ""),
    [dashboard],
  );

  const handleDateChange = (date: string) => {
    const bounds = getDashboardDateBounds();
    if (!isDateInDashboardRange(date, bounds)) return;
    setSelectedDate(date);
  };

  const handleToggle = async (
    slot: MedicineSlot,
    medicineId: number,
    taken: boolean,
  ) => {
    if (!activeFamilyId || !dashboard) return;

    const rowKey = `${slot}:${medicineId}`;
    const previousDashboard = dashboard;

    setTogglingKey(rowKey);
    setError(null);

    const optimisticSlots = {
      ...dashboard.slots,
      [slot]: dashboard.slots[slot].map((entry) =>
        entry.medicine_id === medicineId
          ? {
              ...entry,
              taken,
              taken_at: taken ? new Date().toISOString() : null,
            }
          : entry,
      ),
    };

    setDashboard({
      ...dashboard,
      slots: optimisticSlots,
      metrics: computeMetrics(optimisticSlots),
    });

    try {
      await upsertLog(authFetch, {
        family_id: activeFamilyId,
        medicine_id: medicineId,
        slot,
        taken,
        date: selectedDate,
      });
    } catch (err) {
      setDashboard(previousDashboard);
      setError(err instanceof Error ? err.message : "Failed to save log");
    } finally {
      setTogglingKey(null);
    }
  };

  const userName = currentUser?.name?.split(" ")[0] ?? "there";

  if (familiesLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!activeFamilyId) {
    return (
      <Box sx={{ p: 3.5 }}>
        <Alert severity="info">
          Select or create a family first to view your medication dashboard.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3.5 }, maxWidth: 960 }}>
      <Box sx={{ mb: 2.75 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, fontSize: 20, color: "text.primary" }}
        >
          {getTimeGreeting()}, {userName}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.disabled", mt: 0.5, fontSize: 13 }}
        >
          {formatDashboardDate(selectedDate)} — your personal medicine checklist
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DateNav selectedDate={selectedDate} onDateChange={handleDateChange} />

      {dashboard && (
        <DashboardMetricsBar
          metrics={dashboard.metrics}
          pendingSubtitle={pendingSubtitle}
        />
      )}

      {dashboard?.metrics.total === 0 && (
        <Alert
          severity="info"
          sx={{
            mb: 2,
            bgcolor: "primary.light",
            color: "#2a3fa0",
            border: "1px solid #c0ccfc",
          }}
        >
          No medications scheduled for this day.
        </Alert>
      )}

      {dashboard && (
        <DashboardChecklistCard
          dashboard={dashboard}
          togglingKey={togglingKey}
          onToggle={handleToggle}
        />
      )}
    </Box>
  );
}
