import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

import BirdIcon from '../bird-icon';

type HeatherProps = {
  title: string;
  subtitle: string;
};

const Heather = ({ title, subtitle }: HeatherProps) => (
  <Stack direction="column" gap={5} align="center">
    <BirdIcon />
    <Stack
      direction="column"
      gap={3}
      align="center"
      maxWidth="600px"
      textAlign="center"
    >
      <Typography variant="display-3">{title}</Typography>
      <Typography variant="display-4" color="tertiary">
        {subtitle}
      </Typography>
    </Stack>
  </Stack>
);

export default Heather;
