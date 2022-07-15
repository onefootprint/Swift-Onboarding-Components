import { Property } from 'csstype';
import React from 'react';
import styled, { css } from 'styled-components';
import { LoadingIndicator, Typography } from 'ui';

export type Row<T> = {
  item: T;
  index: Number;
};

export type TableProps<T> = {
  columns: { text: string; width?: Property.Width }[];
  renderTr: (row: Row<T>) => JSX.Element;
  getKeyForRow: (item: T) => string;
  onRowClick?: (item: T) => void;
  items?: Array<T>;
  isLoading?: boolean;
  emptyStateText?: string;
};

const Table = <T,>({
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
            <th key={column.text} style={{ width: column.width || undefined }}>
              <Typography variant="caption-2" color="secondary">
                {column.text}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading && (
          <EmptyTr>
            <td colSpan={columns.length}>
              <LoadingIndicator />
            </td>
          </EmptyTr>
        )}
        {shouldShowEmptyState && (
          <EmptyTr>
            <td colSpan={columns.length}>
              <Typography variant="caption-2">{emptyStateText}</Typography>
            </td>
          </EmptyTr>
        )}
        {shouldShowData &&
          items.map((item: T, index: Number) => (
            <Tr
              onClick={onRowClick && (() => onRowClick(item))}
              key={getKeyForRow(item)}
              isRowClickable={!!onRowClick}
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
    border-radius: 0 0 ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px;
    table-layout: fixed;
  `}

  ${({ theme }) => css`
    td {
      padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
    }

    tr:not(:last-child) td,
    th {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
    }
  `}

  th {
    ${({ theme }) => css`
      user-select: none;
      text-transform: uppercase;
      padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
      background-color: ${theme.backgroundColor.secondary};
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
  transition: 0.1s;
  ${({ theme, isRowClickable }) =>
    isRowClickable &&
    css`
      cursor: pointer;
      :hover {
        background-color: ${theme.backgroundColor.secondary};
      }
    `}
`;

const EmptyTr = styled.tr`
  width: 100%;
  justify-content: center;

  td {
    user-select: none;
    text-align: center;
  }
`;

export default Table;
