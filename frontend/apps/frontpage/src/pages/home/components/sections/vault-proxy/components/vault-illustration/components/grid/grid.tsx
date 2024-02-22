import { Stack } from '@onefootprint/ui';
import { uniqueId } from 'lodash';
import React from 'react';
import styled from 'styled-components';

const Grid = () => {
  const COLS = 10;
  const ROWS = 10;

  return (
    <Stack
      align="center"
      justify="center"
      position="absolute"
      width="100%"
      height="100%"
    >
      <Stack
        direction="row"
        align="center"
        justify="center"
        position="absolute"
        left={0}
        top={0}
        width="100%"
        height="100%"
        gap={8}
      >
        {Array.from({ length: COLS }).map(e => (
          <Line key={uniqueId(e as string)} data-direction="vertical" />
        ))}
      </Stack>
      <Stack
        direction="column"
        align="center"
        justify="center"
        gap={8}
        position="absolute"
        left={0}
        top={0}
        width="100%"
        height="100%"
      >
        {Array.from({ length: ROWS }).map(e => (
          <Line key={uniqueId(e as string)} data-direction="horizontal" />
        ))}
      </Stack>
    </Stack>
  );
};

const Line = styled.div`
  border: 1px dashed #fff;
  opacity: 0.2;
  mix-blend-mode: overlay;
  mask: radial-gradient(
    50% 100% at 50% 50%,
    rgba(0, 0, 0, 1) 0%,
    transparent 100%
  );
  width: 100%;
  height: 100%;
  mask-mode: alpha;

  &[data-direction='vertical'] {
    width: 1px;
    height: 100%;
  }

  &[data-direction='horizontal'] {
    width: 100%;
    height: 1px;
  }
`;

export default Grid;
