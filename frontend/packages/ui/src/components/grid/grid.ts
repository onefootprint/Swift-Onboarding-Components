import type { Spacing } from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import type * as CSS from 'csstype';

import type { BoxProps, BoxPropsStyles } from '../box';
import Box from '../box';
import Stack from '../stack';

type ItemProps = {
  gridArea?: string;
  column?: string;
  row?: string;
  width?: string;
};

type ContainerProps = BoxProps &
  BoxPropsStyles & {
    columns?: string[];
    rows?: string[];
    columnGap?: Spacing;
    rowGap?: Spacing;
    gap?: Spacing;
    templateAreas?: string[];
    alignItems?: CSS.Property.AlignItems;
    width?: string;
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
  ${({
    theme,
    columns,
    rows,
    columnGap,
    rowGap,
    gap,
    templateAreas,
    alignItems,
    width,
  }) => css`
    {props...}
    display: grid;
    width:${width};
    grid-template-columns: ${createColumns(columns)};
    grid-template-rows: ${createRows(rows)};
    grid-gap: ${gap ? theme.spacing[gap] : undefined};
    grid-column-gap: ${columnGap ? theme.spacing[columnGap] : undefined};
    grid-row-gap: ${rowGap ? theme.spacing[rowGap] : undefined};
    align-items:${alignItems};
    grid-template-areas: ${
      templateAreas ? `"${templateAreas.join('"\n"')}"` : undefined
    };
  `}
`;

const Item = styled(Stack)<ItemProps>`
  ${({ gridArea, column, row, width }) => css`
    grid-area: ${gridArea};
    grid-column: ${column};
    grid-row: ${row};
    width: ${width};
  `}
`;

export type { ContainerProps, ItemProps };
export default { Container, Item };
