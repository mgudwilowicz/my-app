import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function ProfileSettings() {
  return (
    <main>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography variant="h4" color="initial">
          Profile settings
        </Typography>
      </Box>
    </main>
  );
}

export default ProfileSettings;
