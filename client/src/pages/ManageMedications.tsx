import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function ManageMedications() {
  return (
    <main>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography variant="h4" color="initial">
          Manage medications
        </Typography>
      </Box>
    </main>
  );
}

export default ManageMedications;
