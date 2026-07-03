import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { pageHeaderStyles } from "../theme/pageStyles";

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  sx?: SxProps<Theme>;
};

export default function PageHeader({ title, subtitle, sx }: PageHeaderProps) {
  return (
    <Box sx={{ ...pageHeaderStyles.container, ...sx }}>
      <Typography variant="h5" sx={pageHeaderStyles.title}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={pageHeaderStyles.subtitle}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
