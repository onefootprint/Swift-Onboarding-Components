import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';

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
    ${createColumnStyles(props.col)}

    ${media.between('xs', 'sm')`
      ${createColumnStyles(props.xs)};
      ${createGutterStyles(theme.grid.col.gutterSize.xs / 2)};
    `}

    ${media.between('sm', 'md')`
      ${createColumnStyles(props.sm)};
      ${createGutterStyles(theme.grid.col.gutterSize.xs / 2)};
    `}

    ${media.between('md', 'lg')`
      ${createColumnStyles(props.md)};
      ${createGutterStyles(theme.grid.col.gutterSize.xs / 2)};
    `}

    ${media.between('lg', 'xl')`
      ${createColumnStyles(props.lg)};
      ${createGutterStyles(theme.grid.col.gutterSize.xs / 2)};
    `}

    ${media.greaterThan('xl')`
      ${createColumnStyles(props.xl)};
      ${createGutterStyles(theme.grid.col.gutterSize.xs / 2)};
    `}
  `}
`;

const createColumnStyles = (columns?: ColumnSize) => {
  if (!columns) return '';
  const singleCol: number = 100 / 12;
  const colFlexBasis: number = singleCol * columns;
  return `
    flex: 0 0 ${colFlexBasis}%;
    max-width: ${colFlexBasis}%;
  `;
};

const createGutterStyles = (gutter: number) => `
  &:not(:first-child) {
    padding-left: ${gutter}px;
  }

  :not(:last-child) {
    padding-right: ${gutter}px;
  }
`;

export default GridColumn;
