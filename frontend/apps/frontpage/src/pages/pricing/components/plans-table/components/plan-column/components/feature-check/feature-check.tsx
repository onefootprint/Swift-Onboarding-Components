import { IcoCheck16 } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

type FeatureCheckProps = {
  children: string;
};

const FeatureCheck = ({ children }: FeatureCheckProps) => (
  <Stack direction="row" gap={2} align="start" marginTop={2}>
    <Stack flexGrow={0} marginTop={2}>
      <IcoCheck16 />
    </Stack>
    <Stack flexGrow={1}>
      <Typography variant="label-3">{children}</Typography>
    </Stack>
  </Stack>
);

export default FeatureCheck;
