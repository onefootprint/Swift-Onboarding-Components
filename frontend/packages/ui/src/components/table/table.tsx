import { Property } from 'csstype';
import times from 'lodash/times';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils';
import Shimmer from '../shimmer';
import Typography from '../typography';

export type TableRow<T> = {
  item: T;
  index: Number;
};

export type TableProps<T> = {
  'aria-label': string;
  columns: { text: string; width?: Property.Width }[];
  emptyStateText?: string;
  getKeyForRow: (item: T) => string;
  isLoading?: boolean;
  items?: Array<T>;
  onRowClick?: (item: T) => void;
  renderTr: (row: TableRow<T>) => JSX.Element;
};

const Table = <T,>({
  'aria-label': ariaLabel,
  columns,
  emptyStateText = 'No results',
  getKeyForRow,
  isLoading,
  items,
  onRowClick,
  renderTr,
}: TableProps<T>) => {
  const shouldShowEmptyState = !isLoading && !items?.length;
  const shouldShowData = !isLoading && items;
  const columnsCount = columns.length;

  return (
    <TableContainer
      aria-live="polite"
      aria-busy={isLoading}
      aria-label={ariaLabel}
    >
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.text} style={{ width: column.width }}>
              {column.text}
            </th>
          ))}
        </tr>
      </thead>
      {isLoading ? (
        <tbody>
          {times(4).map(() => (
            <tr key={Math.random()}>
              {times(columnsCount).map(() => (
                <td key={Math.random()}>
                  <Shimmer aria-hidden sx={{ height: '24px', width: '100%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      ) : (
        <tbody>
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
                data-clickable={!!onRowClick}
                key={getKeyForRow(item)}
                onClick={onRowClick && (() => onRowClick(item))}
              >
                {renderTr({ index, item })}
              </Tr>
            ))}
        </tbody>
      )}
    </TableContainer>
  );
};

const TableContainer = styled.table`
  ${({ theme }) => css`
    border-collapse: separate;
    border-radius: ${theme.borderRadius[2]}px;
    border: 1px solid ${theme.borderColor.tertiary};
    table-layout: fixed;
    text-align: left;
    width: 100%;
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
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      border-radius: ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px 0 0;
      color: ${theme.color.secondary};
      padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
      position: sticky;
      text-transform: uppercase;
      top: 0;
    `}
  }

  p {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Tr = styled.tr`
  ${({ theme }) => css`
    transition: 0.1s;

    &[data-clickable='true'] {
      cursor: pointer;

      &:hover {
        background-color: ${theme.backgroundColor.secondary};
      }
    }
  `}
`;

const EmptyTr = styled.tr`
  td {
    text-align: left;
  }
`;

export default Table;
