import styled, { css } from 'styled';

import media from '../../utils/media';

export type ColumnSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type GridColumnProps = {
  col?: ColumnSize;
  xs?: ColumnSize;
  sm?: ColumnSize;
  md?: ColumnSize;
  lg?: ColumnSize;
  xl?: ColumnSize;
};

const GridColumn = styled.div<GridColumnProps>`
  ${({ theme, ...props }) => css`
    width: 100%;
    ${createColumnStyles(theme.grid.columns, props.col)}

    ${media.between('xs', 'sm')`
      padding-left: ${theme.grid.col.gutterSize.xs / 2}px;
      padding-right: ${theme.grid.col.gutterSize.xs / 2}px;
      ${createColumnStyles(theme.grid.columns, props.xs)}
    `}

    ${media.between('sm', 'md')`
      padding-left: ${theme.grid.col.gutterSize.sm / 2}px;
      padding-right: ${theme.grid.col.gutterSize.sm / 2}px;
      ${createColumnStyles(theme.grid.columns, props.sm)}
    `}

    ${media.between('md', 'lg')`
      padding-left: ${theme.grid.col.gutterSize.md / 2}px;
      padding-right: ${theme.grid.col.gutterSize.md / 2}px;
      ${createColumnStyles(theme.grid.columns, props.md)}
    `}

    ${media.between('lg', 'xl')`
      padding-left: ${theme.grid.col.gutterSize.lg / 2}px;
      padding-right: ${theme.grid.col.gutterSize.lg / 2}px;
      ${createColumnStyles(theme.grid.columns, props.lg)}
    `}

    ${media.greaterThan('xl')`
      padding-left: ${theme.grid.col.gutterSize.xl / 2}px;
      padding-right: ${theme.grid.col.gutterSize.xl / 2}px;
      ${createColumnStyles(theme.grid.columns, props.xl)}
    `}
  `}
`;

const createColumnStyles = (gridColumns: number, columns?: ColumnSize) => {
  if (!columns) return '';
  const singleCol: number = 100 / 12;
  const colFlexBasis: number = singleCol * columns;
  return `
    flex: 0 0 ${colFlexBasis}%;
    max-width: ${colFlexBasis}%;
  `;
};

export default GridColumn;
