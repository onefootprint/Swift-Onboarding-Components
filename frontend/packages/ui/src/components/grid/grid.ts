import type { Spacing } from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import type * as CSS from 'csstype';

import type { BoxProps } from '../box';
import Box from '../box';
import Stack from '../stack';

type ItemProps = {
  gridArea?: string;
  column?: string;
  row?: string;
};

type ContainerProps = BoxProps & {
  columns?: string[];
  rows?: string[];
  columnGap?: Spacing;
  rowGap?: Spacing;
  gap?: Spacing;
  templateAreas?: string[];
  alignItems?: CSS.Property.AlignItems;
};

const createColumns = (columns?: string | string[]) => {
  if (typeof columns === 'string') {
    return columns;
  }

  if (Array.isArray(columns)) {
    return columns.join(' ');
  }

  return undefined;
};

const createRows = (rows?: string | string[]) => {
  if (typeof rows === 'string') {
    return rows;
  }

  if (Array.isArray(rows)) {
    return rows.join(' ');
  }

  return undefined;
};

const Container = styled(Box)<ContainerProps>`
  ${({ theme, columns, rows, columnGap, rowGap, gap, templateAreas }) => css`
    display: grid;
    grid-template-columns: ${createColumns(columns)};
    grid-template-rows: ${createRows(rows)};
    grid-gap: ${gap ? theme.spacing[gap] : undefined};
    grid-column-gap: ${columnGap ? theme.spacing[columnGap] : undefined};
    grid-row-gap: ${rowGap ? theme.spacing[rowGap] : undefined};
    align-items:;
    grid-template-areas: ${templateAreas
      ? `"${templateAreas.join('"\n"')}"`
      : undefined};
  `}
`;

const Item = styled(Stack)<ItemProps>`
  ${({ gridArea, column, row }) => css`
    grid-area: ${gridArea};
    grid-column: ${column};
    grid-row: ${row};
  `}
`;

export type { ContainerProps, ItemProps };
export default { Container, Item };
