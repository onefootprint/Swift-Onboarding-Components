import { Grid, Shimmer, Stack } from '@onefootprint/ui';
import React from 'react';

const Loading = () => {
  const templateAreas = ['one', 'two', 'three', 'four', 'five', 'six'];

  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} aria-label="Loading home...">
      <Stack direction="column" gap={9}>
        {['one', 'two'].map(key => (
          <Stack key={key} direction="column" gap={5}>
            <Shimmer borderRadius="default" flex={1} minHeight="24px" maxWidth="100px" />
            <Grid.Container gap={5} columns={['repeat(3, 1fr)']}>
              {templateAreas.map(gridArea => (
                <div key={gridArea}>
                  <Grid.Item gridArea={gridArea}>
                    <Shimmer borderRadius="default" flex={1} minHeight="116px" minWidth="170px" />
                  </Grid.Item>
                </div>
              ))}
            </Grid.Container>
          </Stack>
        ))}
      </Stack>
    </div>
  );
};

export default Loading;
