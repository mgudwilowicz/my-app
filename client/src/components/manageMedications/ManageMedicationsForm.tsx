import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { FamilyMember } from "@appTypes/Family";
import {
  MEDICINE_SLOTS,
  SLOT_LABELS,
  type Medicine,
  type MedicineFormType,
  type MedicineSlot,
} from "@appTypes/Medicine";
import { fetchFamily } from "../../api/families";
import { useAuthFetch } from "../../hooks/useAuthFetch";
import {
  formatDosageLabel,
  formatSupplyPreview,
  getSupplyStatus,
} from "../../utils/medicineSupply";

export type MedicineFormInput = {
  name: string;
  dosage: string;
  formType: MedicineFormType;
  doseAmount: number;
  packageSize: number;
  remainingAmount: number;
  lowStockThreshold: number;
  restockAmount?: number;
  assignedTo: number;
  notes: string;
  slots: MedicineSlot[];
  startDate: string;
  endDate: string;
};

type ManageMedicationsFormProps = {
  open: boolean;
  familyId: number;
  editingMedicine: Medicine | null;
  isAdmin: boolean;
  defaultAssigneeId: number;
  formError: string | null;
  saving: boolean;
  onClose: () => void;
  onClearError: () => void;
  onSave: (input: MedicineFormInput) => void;
};

function toInputDate(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function normalizePillDoseValue(value: number | null | undefined): string {
  if (value != null && Number.isFinite(value) && value > 0) {
    return String(value);
  }
  return "1";
}

function parsePositiveNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function parseNonNegativeNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

function parseDoseAmount(_formType: MedicineFormType, value: string): number | null {
  return parsePositiveNumber(value);
}

export default function ManageMedicationsForm({
  open,
  familyId,
  editingMedicine,
  isAdmin,
  defaultAssigneeId,
  formError,
  saving,
  onClose,
  onClearError,
  onSave,
}: ManageMedicationsFormProps) {
  const authFetch = useAuthFetch();

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [formType, setFormType] = useState<MedicineFormType>("pill");
  const [doseAmount, setDoseAmount] = useState("1");
  const [packageSize, setPackageSize] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [restockAmount, setRestockAmount] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState<MedicineSlot[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !isAdmin) {
      setFamilyMembers([]);
      setMembersError(null);
      return;
    }

    setMembersLoading(true);
    setMembersError(null);

    async function loadMembers() {
      try {
        const family = await fetchFamily(authFetch, familyId);
        setFamilyMembers(family.members ?? []);
      } catch (err) {
        setMembersError(
          err instanceof Error ? err.message : "Failed to load members",
        );
        setFamilyMembers([]);
      } finally {
        setMembersLoading(false);
      }
    }

    loadMembers();
  }, [open, isAdmin, familyId, authFetch]);

  useEffect(() => {
    if (!open) return;

    if (editingMedicine) {
      setName(editingMedicine.name);
      setFormType(editingMedicine.form_type ?? "pill");
      setDoseAmount(normalizePillDoseValue(editingMedicine.dose_amount));
      setPackageSize(
        editingMedicine.package_size != null
          ? String(editingMedicine.package_size)
          : "",
      );
      setRemainingAmount(
        editingMedicine.remaining_amount != null
          ? String(editingMedicine.remaining_amount)
          : "",
      );
      setLowStockThreshold(
        editingMedicine.low_stock_threshold != null
          ? String(editingMedicine.low_stock_threshold)
          : "5",
      );
      setRestockAmount("");
      setAssignedTo(editingMedicine.assigned_to);
      setNotes(editingMedicine.notes ?? "");
      setSlots([...editingMedicine.slots]);
      setStartDate(toInputDate(editingMedicine.start_date));
      setEndDate(toInputDate(editingMedicine.end_date));
    } else {
      setName("");
      setFormType("pill");
      setDoseAmount("1");
      setPackageSize("");
      setRemainingAmount("");
      setLowStockThreshold("5");
      setRestockAmount("");
      setAssignedTo(isAdmin ? "" : defaultAssigneeId);
      setNotes("");
      setSlots([]);
      setStartDate("");
      setEndDate("");
    }
    setValidationError(null);
  }, [open, editingMedicine, isAdmin, defaultAssigneeId]);

  useEffect(() => {
    if (editingMedicine || !packageSize) return;
    setRemainingAmount(packageSize);
  }, [packageSize, editingMedicine]);

  const parsedDoseAmount = parseDoseAmount(formType, doseAmount);
  const parsedPackageSize = parsePositiveNumber(packageSize);
  const parsedRemainingAmount = parseNonNegativeNumber(remainingAmount);
  const parsedLowStockThreshold = parseNonNegativeNumber(lowStockThreshold);
  const parsedRestockAmount = parsePositiveNumber(restockAmount);

  const supplyPreview = useMemo(() => {
    if (
      parsedDoseAmount == null ||
      parsedRemainingAmount == null ||
      parsedLowStockThreshold == null ||
      slots.length === 0
    ) {
      return null;
    }

    return formatSupplyPreview(
      formType,
      parsedDoseAmount,
      parsedRemainingAmount,
      parsedLowStockThreshold,
      slots,
    );
  }, [
    formType,
    parsedDoseAmount,
    parsedRemainingAmount,
    parsedLowStockThreshold,
    slots,
  ]);

  const supplyStatus = useMemo(() => {
    if (parsedRemainingAmount == null || parsedLowStockThreshold == null) {
      return "untracked" as const;
    }
    return getSupplyStatus(
      formType,
      parsedRemainingAmount,
      parsedLowStockThreshold,
    );
  }, [formType, parsedRemainingAmount, parsedLowStockThreshold]);

  const toggleSlot = (slot: MedicineSlot) => {
    setSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  };

  const handleSave = () => {
    setValidationError(null);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setValidationError("Medicine name is required");
      return;
    }
    if (parsedDoseAmount == null) {
      setValidationError(
        formType === "pill"
          ? "Pills per dose must be greater than 0"
          : "ml per dose must be greater than 0",
      );
      return;
    }
    if (parsedPackageSize == null) {
      setValidationError(
        formType === "pill"
          ? "Pills in one package must be greater than 0"
          : "ml in one bottle must be greater than 0",
      );
      return;
    }
    if (parsedRemainingAmount == null) {
      setValidationError("Remaining stock must be 0 or greater");
      return;
    }
    if (parsedLowStockThreshold == null) {
      setValidationError("Notify threshold must be 0 or greater");
      return;
    }
    if (slots.length === 0) {
      setValidationError("Select at least one daily slot");
      return;
    }
    if (!startDate) {
      setValidationError("Start date is required");
      return;
    }

    const assigneeId = isAdmin ? assignedTo : defaultAssigneeId;
    if (!assigneeId) {
      setValidationError("Please select a family member");
      return;
    }

    const dosageLabel = formatDosageLabel(formType, parsedDoseAmount);
    if (!dosageLabel) {
      setValidationError("Dosage is required");
      return;
    }

    onSave({
      name: trimmedName,
      dosage: dosageLabel,
      formType,
      doseAmount: parsedDoseAmount,
      packageSize: parsedPackageSize,
      remainingAmount: parsedRemainingAmount,
      lowStockThreshold: parsedLowStockThreshold,
      restockAmount: parsedRestockAmount ?? undefined,
      assignedTo: assigneeId,
      notes: notes.trim(),
      slots,
      startDate,
      endDate,
    });
  };

  const displayError = validationError || formError || membersError;
  const dosePerSlotLabel =
    formType === "pill" ? "Pills per dose" : "ml per dose";
  const packageSizeLabel =
    formType === "pill" ? "Pills in one package" : "ml in one bottle";
  const remainingLabel =
    formType === "pill" ? "Pills remaining" : "ml remaining";
  const notifyThresholdLabel =
    formType === "pill"
      ? "Notify when pills remaining drops to"
      : "Notify when ml remaining drops to";
  const packageSuffix = formType === "pill" ? "pills" : "ml";
  const pillQuantityStep = 0.25;

  if (!open) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          {editingMedicine ? "Edit medicine" : "Add medicine"}
        </Typography>

        {displayError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => {
              setValidationError(null);
              setMembersError(null);
              onClearError();
            }}
          >
            {displayError}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Name"
            required
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {isAdmin && (
            <FormControl size="small" required>
              <InputLabel id="assign-to-label">Assign to member</InputLabel>
              <Select
                labelId="assign-to-label"
                label="Assign to member"
                value={assignedTo === "" ? "" : String(assignedTo)}
                onChange={(e: SelectChangeEvent) =>
                  setAssignedTo(Number(e.target.value))
                }
                disabled={membersLoading}
              >
                {familyMembers.map((member) => (
                  <MenuItem key={member.id} value={String(member.id)}>
                    {member.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            label="Notes"
            size="small"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={1}
            sx={{ gridColumn: { sm: isAdmin ? "span 2" : "span 1" } }}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5, fontWeight: 600 }}
          >
            Dosage & supply *
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <FormControl size="small" required>
              <InputLabel id="form-type-label">Form</InputLabel>
              <Select
                labelId="form-type-label"
                label="Form"
                value={formType}
                onChange={(e: SelectChangeEvent) => {
                  setFormType(e.target.value as MedicineFormType);
                }}
              >
                <MenuItem value="pill">Pill</MenuItem>
                <MenuItem value="liquid">Liquid</MenuItem>
              </Select>
            </FormControl>

            {formType === "pill" ? (
              <TextField
                label="Pills per dose"
                required
                size="small"
                type="number"
                value={doseAmount}
                onChange={(e) => setDoseAmount(e.target.value)}
                placeholder="e.g. 1.5"
                slotProps={{
                  input: {
                    inputProps: { min: 0.25, step: 0.25 },
                    endAdornment: (
                      <InputAdornment position="end">pills</InputAdornment>
                    ),
                  },
                }}
              />
            ) : (
              <TextField
                label={dosePerSlotLabel}
                required
                size="small"
                type="number"
                value={doseAmount}
                onChange={(e) => setDoseAmount(e.target.value)}
                slotProps={{
                  input: {
                    inputProps: { min: 0.1, step: 0.1 },
                    endAdornment: (
                      <InputAdornment position="end">ml</InputAdornment>
                    ),
                  },
                }}
              />
            )}

            <TextField
              label={packageSizeLabel}
              required
              size="small"
              type="number"
              value={packageSize}
              onChange={(e) => setPackageSize(e.target.value)}
              slotProps={{
                input: {
                  inputProps: {
                    min: formType === "pill" ? 0.25 : 1,
                    step: formType === "pill" ? pillQuantityStep : 0.1,
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      {packageSuffix}
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label={remainingLabel}
              required
              size="small"
              type="number"
              value={remainingAmount}
              onChange={(e) => setRemainingAmount(e.target.value)}
              slotProps={{
                input: {
                  inputProps: {
                    min: 0,
                    step: formType === "pill" ? pillQuantityStep : 0.1,
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      {packageSuffix}
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label={notifyThresholdLabel}
              required
              size="small"
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              helperText="Show a supply warning in the table at or below this amount"
              slotProps={{
                input: {
                  inputProps: {
                    min: 0,
                    step: formType === "pill" ? pillQuantityStep : 0.1,
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      {packageSuffix}
                    </InputAdornment>
                  ),
                },
              }}
            />

            {editingMedicine && (
              <TextField
                label="Add from new package"
                size="small"
                type="number"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                placeholder={
                  parsedPackageSize != null
                    ? String(parsedPackageSize)
                    : undefined
                }
                helperText="Optional — adds to remaining stock on save"
                slotProps={{
                  input: {
                    inputProps: {
                      min: formType === "pill" ? 0.25 : 1,
                      step: formType === "pill" ? pillQuantityStep : 0.1,
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        {packageSuffix}
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ gridColumn: { sm: "span 2" } }}
              />
            )}
          </Box>

          {supplyPreview && (
            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                fontWeight: 600,
                color:
                  supplyStatus === "low" || supplyStatus === "empty"
                    ? "warning.dark"
                    : "text.secondary",
              }}
            >
              {supplyPreview}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Daily slots *
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {MEDICINE_SLOTS.map((slot) => {
              const selected = slots.includes(slot);
              return (
                <Chip
                  key={slot}
                  label={SLOT_LABELS[slot]}
                  onClick={() => toggleSlot(slot)}
                  sx={{
                    fontWeight: 600,
                    cursor: "pointer",
                    bgcolor: selected ? "primary.light" : "background.paper",
                    border: "1.5px solid",
                    borderColor: selected ? "primary.main" : "divider",
                    color: selected ? "primary.dark" : "text.secondary",
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            mt: 2,
          }}
        >
          <TextField
            label="Start date"
            type="date"
            required
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="End date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mt: 2,
          }}
        >
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
