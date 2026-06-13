import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

export default function MedicationsHeader() {
  return (
    <Stack>
      <Typography variant="h4" gutterBottom>
        Medications
      </Typography>
      <Typography color="text.secondary">
        View and manage active medicines for your family.
      </Typography>
    </Stack>
  );
}
