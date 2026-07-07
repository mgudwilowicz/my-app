import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { FamilyMember } from "@appTypes/Family";
import type { Medicine, MedicineSlot } from "@appTypes/Medicine";
import { fetchFamily } from "../api/families";
import {
  createMedicine,
  deactivateMedicine,
  fetchMedicines,
  updateMedicine,
  type CreateMedicineInput,
  type UpdateMedicineInput,
} from "../api/medicines";
import MedicationsFilter from "../components/medications/MedicationsFilter";
import MedicationsHeader from "../components/medications/MedicationsHeader";
import MedicationsTable from "../components/medications/MedicationsTable";
import ManageMedicationsForm, {
  type MedicineFormInput,
} from "../components/manageMedications/ManageMedicationsForm";
import { useUserContext } from "../context/UserContext";
import { useFamilyContext } from "../context/FamilyContext";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { useFamilyRole } from "../hooks/useFamilyRole";

export default function Medications() {
  const { currentUser } = useUserContext();
  const authFetch = useAuthFetch();
  const { activeFamilyId, loading: familiesLoading } = useFamilyContext();
  const { isAdmin, loading: roleLoading } = useFamilyRole();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [memberFilter, setMemberFilter] = useState("");
  const [slotFilter, setSlotFilter] = useState<MedicineSlot | "">("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deactivateTarget, setDeactivateTarget] = useState<Medicine | null>(
    null,
  );
  const [deactivating, setDeactivating] = useState(false);

  const loadData = useCallback(async () => {
    if (!activeFamilyId) {
      setMedicines([]);
      setFamilyMembers([]);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const medicinesData = await fetchMedicines(authFetch, activeFamilyId);
      setMedicines(medicinesData);

      if (isAdmin) {
        const familyData = await fetchFamily(authFetch, activeFamilyId);
        setFamilyMembers(familyData.members ?? []);
      } else {
        setFamilyMembers([]);
        setMemberFilter("");
        setSlotFilter("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [authFetch, activeFamilyId, isAdmin]);

  useEffect(() => {
    if (currentUser && !roleLoading) {
      loadData();
    }
  }, [currentUser, roleLoading, loadData]);

  const filteredMedicines = useMemo(() => {
    if (!isAdmin) {
      return medicines;
    }

    return medicines.filter((medicine) => {
      if (memberFilter && medicine.assigned_to !== Number(memberFilter)) {
        return false;
      }
      if (slotFilter && !medicine.slots.includes(slotFilter)) {
        return false;
      }
      return true;
    });
  }, [medicines, memberFilter, slotFilter, isAdmin]);

  const handleMemberFilterChange = (event: SelectChangeEvent) => {
    setMemberFilter(event.target.value);
  };

  const handleSlotFilterChange = (event: SelectChangeEvent) => {
    setSlotFilter(event.target.value as MedicineSlot | "");
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingMedicine(null);
    setFormError(null);
  };

  const openFormForAdd = () => {
    setEditingMedicine(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openFormForEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormError(null);
    setFormOpen(true);
  };

  const handleSave = async (input: MedicineFormInput) => {
    if (!activeFamilyId || !currentUser) return;

    setSaving(true);
    setError(null);
    setFormError(null);

    try {
      if (editingMedicine) {
        const updateBody: UpdateMedicineInput = {
          name: input.name,
          dosage: input.dosage,
          form_type: input.formType,
          dose_amount: input.doseAmount,
          remaining_amount: input.remainingAmount,
          low_stock_threshold: input.lowStockThreshold,
          slots: input.slots,
          notes: input.notes || null,
          start_date: input.startDate,
          end_date: input.endDate || null,
        };
        if (isAdmin) {
          updateBody.assigned_to = input.assignedTo;
        }
        await updateMedicine(authFetch, editingMedicine.id, updateBody);
      } else {
        const createBody: CreateMedicineInput = {
          family_id: activeFamilyId,
          assigned_to: input.assignedTo,
          name: input.name,
          dosage: input.dosage,
          form_type: input.formType,
          dose_amount: input.doseAmount,
          remaining_amount: input.remainingAmount,
          low_stock_threshold: input.lowStockThreshold,
          slots: input.slots,
          notes: input.notes || null,
          start_date: input.startDate,
          end_date: input.endDate || null,
        };
        await createMedicine(authFetch, createBody);
      }

      closeForm();
      await loadData();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save medicine",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;

    setDeactivating(true);
    setError(null);
    try {
      await deactivateMedicine(authFetch, deactivateTarget.id);

      setDeactivateTarget(null);
      if (editingMedicine?.id === deactivateTarget.id) {
        closeForm();
      }
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to deactivate medicine",
      );
    } finally {
      setDeactivating(false);
    }
  };

  if (familiesLoading || roleLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!activeFamilyId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Select or create a family first to view medications.
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
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <MedicationsHeader />
        <Button variant="contained" onClick={openFormForAdd}>
        Add new medication
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <MedicationsFilter
        isAdmin={isAdmin}
        familyMembers={familyMembers}
        memberFilter={memberFilter}
        slotFilter={slotFilter}
        onMemberFilterChange={handleMemberFilterChange}
        onSlotFilterChange={handleSlotFilterChange}
      />

      <ManageMedicationsForm
        open={formOpen}
        familyId={activeFamilyId}
        editingMedicine={editingMedicine}
        isAdmin={isAdmin}
        defaultAssigneeId={currentUser?.id ?? 0}
        formError={formError}
        saving={saving}
        onClose={closeForm}
        onClearError={() => setFormError(null)}
        onSave={handleSave}
      />

      <MedicationsTable
        medicines={filteredMedicines}
        emptyMessage={
          medicines.length > 0
            ? "No medications match your filters."
            : "No active medications yet. Click Add medicine to create one."
        }
        editingMedicineId={editingMedicine?.id ?? null}
        deactivateTarget={deactivateTarget}
        deactivating={deactivating}
        onEdit={openFormForEdit}
        onDeactivate={setDeactivateTarget}
        onCancelDeactivate={() => setDeactivateTarget(null)}
        onConfirmDeactivate={handleDeactivate}
      />
    </Box>
  );
}
