import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function Members() {
  return (
    <main>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography variant="h4" color="initial">
          Members
        </Typography>
      </Box>
    </main>
  );
}

export default Members;
