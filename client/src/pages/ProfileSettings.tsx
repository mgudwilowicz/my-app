import React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../components/PageHeader";
import { pageContainerSx } from "../theme/pageStyles";

function ProfileSettings() {
  return (
    <Box sx={pageContainerSx}>
      <PageHeader title="Profile settings" subtitle="Manage your account details." />
    </Box>
  );
}

export default ProfileSettings;
