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

type MedicationsFilterProps = {
  isAdmin: boolean;
  familyMembers: FamilyMember[];
  memberFilter: string;
  slotFilter: MedicineSlot | "";
  onMemberFilterChange: (event: SelectChangeEvent) => void;
  onSlotFilterChange: (event: SelectChangeEvent) => void;
};

export default function MedicationsFilter({
  isAdmin,
  familyMembers,
  memberFilter,
  slotFilter,
  onMemberFilterChange,
  onSlotFilterChange,
}: MedicationsFilterProps) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        mb: 2,
        flexWrap: "wrap",
      }}
    >
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
              {member.email}
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
    </Box>
  );
}
