import React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../components/PageHeader";

function Reports() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3.5 }, maxWidth: 960 }}>
      <PageHeader title="Reports" subtitle="Track medication adherence over time." />
    </Box>
  );
}

export default Reports;
