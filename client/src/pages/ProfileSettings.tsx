import React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../components/PageHeader";

function ProfileSettings() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3.5 }, maxWidth: 960 }}>
      <PageHeader title="Profile settings" subtitle="Manage your account details." />
    </Box>
  );
}

export default ProfileSettings;
