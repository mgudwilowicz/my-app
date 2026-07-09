import React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../components/PageHeader";
import { pageContainerSx } from "../theme/pageStyles";

function Reports() {
  return (
    <Box sx={pageContainerSx}>
      <PageHeader title="Reports" subtitle="Track medication adherence over time." />
    </Box>
  );
}

export default Reports;
