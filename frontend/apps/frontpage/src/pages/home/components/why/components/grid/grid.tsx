import times from 'lodash/times';
import React from 'react';

import Square from './components/square';
import {
  LAST_COLUMNS_INDEX,
  SELECTED_SQUARES,
  SQUARES_COUNT,
} from './grid.constants';
import S from './grid.styles';

const Grid = () => (
  <S.Container>
    {times(SQUARES_COUNT).map((value: number, index: number) => (
      <Square
        key={value}
        lastColumn={index > LAST_COLUMNS_INDEX}
        selected={SELECTED_SQUARES.includes(index)}
      />
    ))}
  </S.Container>
);

export default Grid;
