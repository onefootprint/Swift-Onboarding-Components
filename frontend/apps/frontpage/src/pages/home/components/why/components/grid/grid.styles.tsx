import styled, { css } from 'styled';

import { COLUMNS_COUNT, ROWS_COUNT, SQUARE_SIZE } from './grid.constants';

const Container = styled.ul`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px dashed #c2cbc3;
    display: inline-grid;
    grid-auto-flow: column;
    grid-template-columns: repeat(${COLUMNS_COUNT}, ${SQUARE_SIZE});
    grid-template-rows: repeat(${ROWS_COUNT}, ${SQUARE_SIZE});
  `}
`;

export default { Container };
