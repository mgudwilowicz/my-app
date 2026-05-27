import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function AllMedications() {
  return (
    <main>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography variant="h4" color="initial">
          All medications
        </Typography>
      </Box>
    </main>
  );
}

export default AllMedications;
