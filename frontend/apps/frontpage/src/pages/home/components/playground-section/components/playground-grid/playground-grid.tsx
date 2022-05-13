import times from 'lodash/times';
import React from 'react';
import styled, { css } from 'styled';

import PlaygroundSquare from './components/playground-square';
import {
  columnsCount,
  lastColumnsIndex,
  rowsCount,
  selectedSquares,
  squaresCount,
  squareSize,
} from './grid.constants';

const PlaygroundGrid = () => (
  <Grid>
    {times(squaresCount).map((value: number, index: number) => (
      <PlaygroundSquare
        key={value}
        lastColumn={index > lastColumnsIndex}
        selected={selectedSquares.includes(index)}
      />
    ))}
  </Grid>
);

const Grid = styled.ul`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px dashed #c2cbc3;
    display: inline-grid;
    grid-auto-flow: column;
    grid-template-columns: repeat(${columnsCount}, ${squareSize});
    grid-template-rows: repeat(${rowsCount}, ${squareSize});
  `}
`;

export default PlaygroundGrid;
