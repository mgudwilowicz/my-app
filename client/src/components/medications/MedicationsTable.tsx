import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { formatMedicinePeriod, type Medicine } from "@appTypes/Medicine";
import { MedicineSlotPills } from "../MedicineSlotPills";
import {
  medicineTableCardSx,
  medicineTableSx,
} from "../../theme/medicineTableStyles";
import {
  formatSupplySummary,
  getRefillTooltipMessage,
  getSupplyStatus,
} from "../../utils/medicineSupply";

function SupplyCell({ medicine }: { medicine: Medicine }) {
  const status = getSupplyStatus(
    medicine.form_type,
    medicine.remaining_amount,
    medicine.low_stock_threshold,
  );

  if (status === "untracked") {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  const summary = formatSupplySummary(
    medicine.form_type,
    medicine.remaining_amount,
    medicine.dose_amount,
    medicine.slots,
  );
  const tooltipMessage = getRefillTooltipMessage(
    status,
    medicine.form_type,
    medicine.remaining_amount,
  );

  if (status === "low" || status === "empty") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Tooltip title={tooltipMessage ?? ""}>
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              color: status === "empty" ? "error.main" : "warning.main",
              cursor: "help",
            }}
          >
            {status === "empty" ? (
              <ErrorOutlineIcon fontSize="small" />
            ) : (
              <WarningAmberOutlinedIcon fontSize="small" />
            )}
          </Box>
        </Tooltip>
        <Typography variant="body2">{summary}</Typography>
      </Box>
    );
  }

  return <Typography variant="body2">{summary}</Typography>;
}

function NotesCell({ notes }: { notes: string | null }) {
  const text = notes?.trim();

  if (!text) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <>
      <Tooltip title={text}>
        <Typography
          variant="body2"
          noWrap
          sx={{ display: { xs: "none", md: "block" }, maxWidth: 200 }}
        >
          {text}
        </Typography>
      </Tooltip>
      <Tooltip title={text}>
        <Box
          component="span"
          aria-label="View notes"
          sx={{
            display: { xs: "inline-flex", md: "none" },
            alignItems: "center",
            color: "text.secondary",
            cursor: "help",
          }}
        >
          <InfoOutlinedIcon fontSize="small" />
        </Box>
      </Tooltip>
    </>
  );
}

type MedicationsTableProps = {
  medicines: Medicine[];
  activeFamilyId: number;
  emptyMessage: string;
  editingMedicineId: number | null;
  deactivateTarget: Medicine | null;
  deactivating: boolean;
  onEdit: (medicine: Medicine) => void;
  onDeactivate: (medicine: Medicine) => void;
  onCancelDeactivate: () => void;
  onConfirmDeactivate: () => void;
};

export default function MedicationsTable({
  medicines,
  activeFamilyId,
  emptyMessage,
  editingMedicineId,
  deactivateTarget,
  deactivating,
  onEdit,
  onDeactivate,
  onCancelDeactivate,
  onConfirmDeactivate,
}: MedicationsTableProps) {
  return (
    <>
      <Card variant="outlined" sx={medicineTableCardSx}>
        {medicines.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">{emptyMessage}</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={medicineTableSx}>
              <TableHead>
                <TableRow>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Supply</TableCell>
                  <TableCell>Slots</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medicines.map((medicine) => {
                  const isOtherFamilyMedicine =
                    medicine.family_id !== activeFamilyId;

                  return (
                  <TableRow
                    key={medicine.id}
                    hover
                    selected={editingMedicineId === medicine.id}
                    sx={{
                      ...(!medicine.is_active && { opacity: 0.72 }),
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {isOtherFamilyMedicine && (
                          <Tooltip title="Assigned from another family">
                            <Box
                              component="span"
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                bgcolor: "warning.main",
                                flexShrink: 0,
                                cursor: "help",
                              }}
                            />
                          </Tooltip>
                        )}
                        {medicine.name}
                      </Box>
                    </TableCell>
                    <TableCell>{medicine.assigned_to_name ?? "—"}</TableCell>
                    <TableCell>{medicine.dosage ?? "—"}</TableCell>
                    <TableCell>
                      <NotesCell notes={medicine.notes} />
                    </TableCell>
                    <TableCell>
                      <SupplyCell medicine={medicine} />
                    </TableCell>
                    <TableCell>
                      <MedicineSlotPills slots={medicine.slots} />
                    </TableCell>
                    <TableCell>
                      {formatMedicinePeriod(
                        medicine.start_date,
                        medicine.end_date,
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={medicine.is_active ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          bgcolor: medicine.is_active
                            ? "success.light"
                            : "action.selected",
                          color: medicine.is_active
                            ? "success.dark"
                            : "text.secondary",
                          fontWeight: 600,
                          fontSize: "0.6875rem",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          aria-label="Edit medicine"
                          onClick={() => onEdit(medicine)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {medicine.is_active && (
                        <Tooltip title="Deactivate">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Deactivate medicine"
                            onClick={() => onDeactivate(medicine)}
                          >
                            <RemoveCircleOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={Boolean(deactivateTarget)} onClose={onCancelDeactivate}>
        <DialogTitle>Deactivate medicine?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deactivate {deactivateTarget?.name}? It will be hidden from active
            lists. You can add it again later if needed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelDeactivate}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={onConfirmDeactivate}
            disabled={deactivating}
          >
            {deactivating ? "Deactivating…" : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
