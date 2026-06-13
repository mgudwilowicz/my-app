import {
  Box,
  Button,
  Card,
  CardContent,
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
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import { formatMedicinePeriod, type Medicine } from "@appTypes/Medicine";
import { MedicineSlotPills } from "../MedicineSlotPills";
import {
  medicineTableContainerSx,
  medicineTableSx,
} from "../../theme/medicineTableStyles";

type MedicationsTableProps = {
  medicines: Medicine[];
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
      <Card>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          {medicines.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary">{emptyMessage}</Typography>
            </Box>
          ) : (
            <TableContainer sx={medicineTableContainerSx}>
              <Table sx={medicineTableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>Medicine</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>Dosage</TableCell>
                    <TableCell>Slots</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicines.map((medicine) => (
                    <TableRow
                      key={medicine.id}
                      hover
                      selected={editingMedicineId === medicine.id}
                    >
                      <TableCell>{medicine.name}</TableCell>
                      <TableCell>
                        {medicine.assigned_to_name ?? "—"}
                      </TableCell>
                      <TableCell>{medicine.dosage ?? "—"}</TableCell>
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
                          label="Active"
                          size="small"
                          sx={{
                            bgcolor: "#d6f5e9",
                            color: "#0a6642",
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
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
