import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function Header() {
  return (
    <Stack
      sx={{
        background: "white",
        p: 3,
        mb: 4,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Typography variant="h6">Page Overview</Typography>
    </Stack>
  );
}

export default Header;
