import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, CircularProgress } from "@mui/material";
import { fetchDashboard, upsertLog } from "../api/logs";
import DashboardChecklistCard from "../components/dashboard/DashboardChecklistCard";
import DateNav from "../components/dashboard/DateNav";
import DashboardMetricsBar from "../components/dashboard/DashboardMetrics";
import PageHeader from "../components/PageHeader";
import { centeredLoaderSx, pageContainerSx } from "../theme/pageStyles";
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

  const userName = currentUser?.name?.trim() || "there";

  if (familiesLoading) {
    return (
      <Box sx={centeredLoaderSx}>
        <CircularProgress />
      </Box>
    );
  }

  if (!activeFamilyId) {
    return (
      <Box sx={pageContainerSx}>
        <Alert severity="info">
          Select or create a family first to view your medication dashboard.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={centeredLoaderSx}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={pageContainerSx}>
      <PageHeader
        title={`${getTimeGreeting()}, ${userName}`}
        subtitle={`${formatDashboardDate(selectedDate)} — your personal medicine checklist`}
      />

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
            color: "primary.dark",
            border: "1px solid",
            borderColor: "divider",
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
