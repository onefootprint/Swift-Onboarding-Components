import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import Stack from '../stack';
import type { GridContainerProps, GridTag, ItemProps } from './grid.types';
import { getBorders, getMargin, getPadding } from './grid.utils';

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

// TODO: Add "$" in front of props to prevent them from being passed to the DOM.
const Container = styled('div').attrs<{ as: GridTag }>(({ as }) => ({
  as,
}))<GridContainerProps>`
  ${({ theme, ...props }) => css`
    display: grid;
    width: ${props.width};
    grid-template-columns: ${createColumns(props.columns)};
    grid-template-rows: ${createRows(props.rows)};
    grid-gap: ${props.gap ? theme.spacing[props.gap] : undefined};
    grid-column-gap: ${props.columnGap
      ? theme.spacing[props.columnGap]
      : undefined};
    grid-row-gap: ${props.rowGap ? theme.spacing[props.rowGap] : undefined};
    align-items: ${props.alignItems};
    justify-content: ${props.justifyContent};
    grid-template-areas: ${props.templateAreas
      ? `"${props.templateAreas.join('"\n"')}"`
      : undefined};

    /* Box */
    ${getBorders(props, theme)};
    padding: ${getPadding(props, theme)};
    margin: ${getMargin(props, theme)};
    ${props.fontStyle && createFontStyles(props.fontStyle)};
    box-shadow: ${props.elevation
      ? theme.elevation[props.elevation]
      : undefined};
    background-color: ${(props.backgroundColor &&
      theme.backgroundColor[props.backgroundColor]) ||
    (props.surfaceColor && theme.surfaceColor[props.surfaceColor])};
    position: ${props.position || 'relative'};
    display: ${props.display};
    text-align: ${props.textAlign};
    border-radius: ${props.borderRadius
      ? theme.borderRadius[props.borderRadius]
      : undefined};
    width: ${props.width};
    height: ${props.height};
    overflow: ${props.overflow};
    min-width: ${props.minWidth};
    min-height: ${props.minHeight};
    max-width: ${props.maxWidth};
    max-height: ${props.maxHeight};
    visibility: ${props.visibility};
    overflow: ${props.overflow};
    top: ${props.top ? theme.spacing[props.top] : undefined};
    bottom: ${props.bottom ? theme.spacing[props.bottom] : undefined};
    left: ${props.left ? theme.spacing[props.left] : undefined};
    right: ${props.right ? theme.spacing[props.right] : undefined};
    z-index: ${props.zIndex};
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

export type { GridContainerProps, ItemProps };
export default { Container, Item };
