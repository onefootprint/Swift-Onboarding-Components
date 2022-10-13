import { Box, SXStyleProps, Typography } from '@onefootprint/ui';
import React from 'react';

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
      sx={{ marginBottom: 3 }}
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
