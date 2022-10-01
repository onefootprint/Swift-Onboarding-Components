import { media, Typography } from '@onefootprint/ui';
import times from 'lodash/times';
import React from 'react';
import styled, { css } from 'styled-components';

import PlaygroundSquare from './components/playground-square';
import { selectedSquares, settings } from './playground-grid.constants';

type PlaygroundGridProps = {
  tooltips: string[];
  instructions: string;
};

const PlaygroundGrid = ({ tooltips, instructions }: PlaygroundGridProps) => {
  const [tooltipFallback] = tooltips;
  return (
    <Container>
      <Grid
        columns={settings.columns}
        rows={settings.rows}
        size={settings.size}
      >
        {times(settings.itemsCount).map((value: number, index: number) => {
          const isSelected = selectedSquares.includes(index);
          const tooltipIndex = isSelected
            ? selectedSquares.findIndex(squareNumber => squareNumber === index)
            : undefined;
          return (
            <PlaygroundSquare
              isSelected={isSelected}
              key={value}
              lastColumn={index > settings.lastColumnsIndex}
              text={tooltipIndex ? tooltips[tooltipIndex] : tooltipFallback}
            />
          );
        })}
      </Grid>
      <InstructionsContainer>
        <Typography variant="caption-1" color="primary" as="p">
          {instructions}
        </Typography>
      </InstructionsContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: ${theme.spacing[5]}px;
  `}
`;

const InstructionsContainer = styled.div`
  display: none;

  ${media.greaterThan('lg')`
    display: block;
  `}
`;

const Grid = styled.ul<{ columns: number; rows: number; size: string }>`
  ${({ theme, columns, rows, size }) => css`
    border-radius: ${theme.borderRadius[2]}px;
    border: ${theme.borderWidth[1]}px dashed #a2d3aa;
    display: inline-grid;
    grid-auto-flow: column;
    grid-template-columns: repeat(${columns}, ${size});
    grid-template-rows: repeat(${rows}, ${size});
  `}
`;

export default PlaygroundGrid;
