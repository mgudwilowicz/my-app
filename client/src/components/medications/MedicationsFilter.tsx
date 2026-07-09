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

const filterControlSx = {
  minWidth: 0,
  width: "100%",
  "& .MuiInputLabel-root": {
    fontSize: { xs: "0.75rem", sm: "1rem" },
  },
  "& .MuiSelect-select": {
    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
    py: { xs: 0.875, sm: 1 },
  },
} as const;

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
        display: "grid",
        gridTemplateColumns: isAdmin
          ? "repeat(3, minmax(0, 1fr))"
          : "minmax(0, 1fr)",
        gap: { xs: 0.75, sm: 1 },
        mb: 2,
        maxWidth: isAdmin ? "100%" : 200,
      }}
    >
      {isAdmin && (
        <>
          <FormControl size="small" sx={filterControlSx}>
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

          <FormControl size="small" sx={filterControlSx}>
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

      <FormControl size="small" sx={filterControlSx}>
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
