import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

type HeaderProps = {
  title: string;
  subtitle?: string;
};

const Header = ({ title, subtitle }: HeaderProps) => (
  <Box gap={3} marginBottom={7}>
    <Typography color="primary" variant="heading-3" center>
      {title}
    </Typography>
    {subtitle && (
      <Typography color="primary" variant="body-2" center>
        {subtitle}
      </Typography>
    )}
  </Box>
);

export default Header;
