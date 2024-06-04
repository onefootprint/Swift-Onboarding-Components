import { Grid, Shimmer } from '@onefootprint/ui';
import React from 'react';

const Loading = () => {
  const templateAreas = ['one', 'two', 'three', 'four', 'five', 'six'];

  return (
    <div role="progressbar" aria-label="Loading home...">
      <Grid.Container
        gap={5}
        columns={['repeat(3, 1fr)']}
        templateAreas={templateAreas}
      >
        {templateAreas.map(gridArea => (
          <div key={gridArea}>
            <Grid.Item gridArea={gridArea}>
              <Shimmer
                borderRadius="default"
                flex={1}
                minHeight="116px"
                minWidth="170px"
              />
            </Grid.Item>
          </div>
        ))}
      </Grid.Container>
    </div>
  );
};

export default Loading;
