import { Shimmer, Stack } from '@onefootprint/ui';
import times from 'lodash/times';
import React from 'react';

const Loading = () => (
  <Stack
    direction="column"
    gap={5}
    aria-label="Loading domains restrictions..."
    role="progressbar"
  >
    {times(2).map(index => (
      <Stack
        gap={3}
        justify="space-between"
        key={index}
        paddingLeft={3}
        paddingRight={3}
      >
        <Shimmer height="24px" width="260px" />
        <Shimmer height="24px" width="24px" />
      </Stack>
    ))}
  </Stack>
);

export default Loading;
