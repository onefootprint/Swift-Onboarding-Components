import { Property } from 'csstype';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils';
import LoadingIndicator from '../loading-indicator';
import Typography from '../typography';

export type TableRow<T> = {
  item: T;
  index: Number;
};

export type TableProps<T> = {
  loadingAriaLabel?: string;
  columns: { text: string; width?: Property.Width }[];
  renderTr: (row: TableRow<T>) => JSX.Element;
  getKeyForRow: (item: T) => string;
  onRowClick?: (item: T) => void;
  items?: Array<T>;
  isLoading?: boolean;
  emptyStateText?: string;
};

const Table = <T,>({
  loadingAriaLabel = 'Loading...',
  columns,
  renderTr,
  getKeyForRow,
  onRowClick,
  items,
  isLoading,
  emptyStateText = 'No results',
}: TableProps<T>) => {
  const shouldShowEmptyState = !isLoading && !items?.length;
  const shouldShowData = !isLoading && items;

  return (
    <TableContainer>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.text} style={{ width: column.width }}>
              {column.text}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading && (
          <LoadingTr>
            <td colSpan={columns.length}>
              <LoadingIndicator aria-label={loadingAriaLabel} />
            </td>
          </LoadingTr>
        )}
        {shouldShowEmptyState && (
          <EmptyTr>
            <td colSpan={columns.length}>
              <Typography variant="body-3">{emptyStateText}</Typography>
            </td>
          </EmptyTr>
        )}
        {shouldShowData &&
          items.map((item: T, index: Number) => (
            <Tr
              data-testid={getKeyForRow(item)}
              isRowClickable={!!onRowClick}
              key={getKeyForRow(item)}
              onClick={onRowClick && (() => onRowClick(item))}
            >
              {renderTr({ index, item })}
            </Tr>
          ))}
      </tbody>
    </TableContainer>
  );
};

const TableContainer = styled.table`
  ${({ theme }) => css`
    width: 100%;
    border-collapse: separate;
    min-width: 100%;
    text-align: left;
    border: 1px solid ${theme.borderColor.tertiary};
    border-top: none;
    border-radius: ${theme.borderRadius[2]}px;
    table-layout: fixed;
  `}

  ${({ theme }) => css`
    td {
      ${createFontStyles('body-3')};
      color: ${theme.color.primary};
      height: 46px;
      padding: 0 ${theme.spacing[6]}px;
      vertical-align: middle;
    }

    tr:not(:last-child) td,
    th {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
    }
  `}

  th {
    ${({ theme }) => css`
      ${createFontStyles('caption-2')};
      background-color: ${theme.backgroundColor.secondary};
      border-top: 1px solid ${theme.borderColor.tertiary};
      color: ${theme.color.secondary};
      padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
      position: sticky;
      text-transform: uppercase;
      top: 0;

      &:first-child {
        border-top-left-radius: ${theme.borderRadius[2]}px;
      }

      &:last-child {
        border-top-right-radius: ${theme.borderRadius[2]}px;
      }
    `}
  }

  p {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Tr = styled.tr<{
  isRowClickable: boolean;
}>`
  ${({ theme, isRowClickable }) => css`
    transition: 0.1s;

    ${isRowClickable &&
    css`
      cursor: pointer;

      :hover {
        background-color: ${theme.backgroundColor.secondary};
      }
    `}
  `}
`;

const LoadingTr = styled.tr`
  width: 100%;
  justify-content: center;

  td {
    text-align: center;
  }
`;

const EmptyTr = styled.tr`
  td {
    text-align: left;
  }
`;

export default Table;
