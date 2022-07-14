import React from 'react';
import { Box, SXStyleProps, Typography } from 'ui';

export type HeaderTitleProps = {
  title: string;
  subtitle: string;
  sx?: SXStyleProps;
};

const HeaderTitle = ({ title, subtitle, sx }: HeaderTitleProps) => (
  <Box sx={{ textAlign: 'center', ...sx }}>
    <Typography
      as="h2"
      color="primary"
      sx={{ marginBottom: 2 }}
      variant="heading-3"
    >
      {title}
    </Typography>
    <Typography variant="body-2" color="secondary" as="h3">
      {subtitle}
    </Typography>
  </Box>
);

export default HeaderTitle;
