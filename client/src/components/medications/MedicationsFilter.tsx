import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { FamilyMember } from "@appTypes/Family";
import {
  MEDICINE_SLOTS,
  SLOT_LABELS,
  type MedicineSlot,
} from "@appTypes/Medicine";
import type { MedicineStatusFilter } from "../../api/medicines";
import { getDisplayName } from "../../utils/familyOverview";

type MedicationsFilterProps = {
  isAdmin: boolean;
  familyMembers: FamilyMember[];
  statusFilter: MedicineStatusFilter;
  memberFilter: string;
  slotFilter: MedicineSlot | "";
  onStatusFilterChange: (event: SelectChangeEvent) => void;
  onMemberFilterChange: (event: SelectChangeEvent) => void;
  onSlotFilterChange: (event: SelectChangeEvent) => void;
};

export default function MedicationsFilter({
  isAdmin,
  familyMembers,
  statusFilter,
  memberFilter,
  slotFilter,
  onStatusFilterChange,
  onMemberFilterChange,
  onSlotFilterChange,
}: MedicationsFilterProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        mb: 2,
        flexWrap: "wrap",
      }}
    >
      {isAdmin && (
        <>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="member-filter-label">Member</InputLabel>
            <Select
              labelId="member-filter-label"
              label="Member"
              value={memberFilter}
              onChange={onMemberFilterChange}
            >
              <MenuItem value="">All members</MenuItem>
              {familyMembers.map((member) => (
                <MenuItem key={member.id} value={String(member.id)}>
                  {getDisplayName(member)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="slot-filter-label">Time slot</InputLabel>
            <Select
              labelId="slot-filter-label"
              label="Time slot"
              value={slotFilter}
              onChange={onSlotFilterChange}
            >
              <MenuItem value="">All slots</MenuItem>
              {MEDICINE_SLOTS.map((slot) => (
                <MenuItem key={slot} value={slot}>
                  {SLOT_LABELS[slot]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="status-filter-label">Status</InputLabel>
        <Select
          labelId="status-filter-label"
          label="Status"
          value={statusFilter}
          onChange={onStatusFilterChange}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="all">All</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
