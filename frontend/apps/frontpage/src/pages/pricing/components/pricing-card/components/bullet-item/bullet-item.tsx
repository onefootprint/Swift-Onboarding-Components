import { IcoCheck16 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

type BulletItemProps = {
  title: string;
  subtitle?: string;
};
const BulletItem = ({ title, subtitle }: BulletItemProps) => (
  <Stack direction="row" gap={2} justify="flex-start" height="100%">
    <IconBounds align="center" justify="center">
      <IcoCheck16 />
    </IconBounds>
    <Stack direction="column" gap={1} height="fit-content">
      <Typography
        variant="label-2"
        sx={{
          display: 'inline-block',
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body-3"
          color="tertiary"
          sx={{
            display: 'inline-block',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Stack>
  </Stack>
);

const IconBounds = styled(Stack)`
  height: 20px;
  width: 20px;
`;
export default BulletItem;
