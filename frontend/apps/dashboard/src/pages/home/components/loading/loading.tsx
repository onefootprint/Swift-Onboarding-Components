import { Grid } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

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
              <EmptyBox />
            </Grid.Item>
          </div>
        ))}
      </Grid.Container>
    </div>
  );
};

const EmptyBox = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    min-height: 116px;
    min-width: 170px;
    flex: 1;
  `}
`;

export default Loading;
