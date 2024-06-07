/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import styled, { css } from 'styled-components';

import type { StackProps } from '../stack';
import Stack from '../stack';
import type { GridContainerProps, GridItemProps } from './grid.types';
import { createColumns, createRows } from './grid.utils';

const Container = ({ columns, rows, templateAreas, children, ...props }: GridContainerProps) => (
  <StyledContainer $columns={columns} $rows={rows} $templateAreas={templateAreas} {...props}>
    {children}
  </StyledContainer>
);

const StyledContainer = styled(Stack)<
  StackProps & {
    $columns?: string[];
    $rows?: string[];
    $templateAreas?: string[];
  }
>`
  ${({ $columns, $rows, $templateAreas }) => css`
    display: grid;
    grid-template-columns: ${createColumns($columns)};
    grid-template-rows: ${createRows($rows)};
    grid-template-areas: ${$templateAreas ? `"${$templateAreas.join('"\n"')}"` : undefined};
  `}
`;

const Item = ({ column, row, children, ...props }: GridItemProps) => <StyledItem {...props}>{children}</StyledItem>;

const StyledItem = styled(Stack)<
  StackProps & {
    $column?: string;
    $row?: string;
  }
>`
  ${({ $column, $row }) => css`
    grid-column: ${$column};
    grid-row: ${$row};
  `}
`;

export default { Container, Item };
