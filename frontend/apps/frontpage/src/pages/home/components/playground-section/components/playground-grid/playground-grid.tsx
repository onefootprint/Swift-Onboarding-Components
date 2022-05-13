import times from 'lodash/times';
import React from 'react';
import styled, { css } from 'styled';

import PlaygroundSquare from './components/playground-square';
import { selectedSquares, settings } from './playground-grid.constants';

type PlaygroundGridProps = {
  tooltips: string[];
};

const PlaygroundGrid = ({ tooltips }: PlaygroundGridProps) => {
  const [tooltipFallback] = tooltips;
  return (
    <Grid columns={settings.columns} rows={settings.rows} size={settings.size}>
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
  );
};

const Grid = styled.ul<{ columns: number; rows: number; size: string }>`
  ${({ theme, columns, rows, size }) => css`
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px dashed #c2cbc3;
    display: inline-grid;
    grid-auto-flow: column;
    grid-template-columns: repeat(${columns}, ${size});
    grid-template-rows: repeat(${rows}, ${size});
  `}
`;

export default PlaygroundGrid;
