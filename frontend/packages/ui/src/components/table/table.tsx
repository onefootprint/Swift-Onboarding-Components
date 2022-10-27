import { Property } from 'csstype';
import times from 'lodash/times';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils';
import Shimmer from '../shimmer';
import Typography from '../typography';
import TableFilters from './components/table-filters';

export type TableRow<T> = {
  item: T;
  index: Number;
};

export type TableProps<T> = {
  'aria-label': string;
  columns: { id?: string; text: string; width?: Property.Width }[];
  emptyStateText?: string;
  getKeyForRow: (item: T) => string;
  hideThead?: boolean;
  isLoading?: boolean;
  items?: Array<T>;
  onChangeSearchText?: (text: string) => void;
  onRowClick?: (item: T) => void;
  renderActions?: () => React.ReactNode;
  renderTr: (row: TableRow<T>) => JSX.Element;
  initialSearch?: string;
};

const Table = <T,>({
  'aria-label': ariaLabel,
  columns,
  emptyStateText = 'No results',
  getKeyForRow,
  hideThead,
  isLoading,
  items,
  onChangeSearchText,
  onRowClick,
  renderActions,
  renderTr,
  initialSearch,
}: TableProps<T>) => {
  const shouldRenderFilters = onChangeSearchText || renderActions;
  const shouldShowEmptyState = !isLoading && !items?.length;
  const shouldShowData = !isLoading && items;
  const columnsCount = columns.length;

  return (
    <>
      {shouldRenderFilters ? (
        <TableFilters
          initialValue={initialSearch}
          onChangeText={onChangeSearchText}
        >
          {renderActions?.()}
        </TableFilters>
      ) : null}
      <TableContainer
        aria-live="polite"
        aria-busy={isLoading}
        aria-label={ariaLabel}
      >
        <colgroup>
          {columns.map(column => (
            <col
              key={column.id || column.text}
              style={{ width: column.width }}
            />
          ))}
        </colgroup>
        {hideThead ? null : (
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.id || column.text}>{column.text}</th>
              ))}
            </tr>
          </thead>
        )}
        {isLoading ? (
          <tbody>
            {times(4).map(() => (
              <tr key={Math.random()}>
                {times(columnsCount).map(() => (
                  <td key={Math.random()}>
                    <Shimmer
                      aria-hidden
                      sx={{ height: '24px', width: '100%' }}
                    />
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
    </>
  );
};

const TableContainer = styled.table`
  ${({ theme }) => css`
    border-collapse: separate;
    border-radius: ${theme.borderRadius.default}px;
    border: 1px solid ${theme.borderColor.tertiary};
    table-layout: fixed;
    text-align: left;
    width: 100%;

    th {
      ${createFontStyles('caption-2')};
      background: ${theme.backgroundColor.secondary};
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      color: ${theme.color.secondary};
      padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
      text-transform: uppercase;

      &:first-child {
        border-top-left-radius: ${theme.borderRadius.default}px;
      }

      &:last-child {
        border-top-right-radius: ${theme.borderRadius.default}px;
      }
    }

    td {
      ${createFontStyles('body-3')};
      color: ${theme.color.primary};
      height: 46px;
      padding: 0 ${theme.spacing[6]}px;
      vertical-align: middle;
    }

    tbody tr {
      &:not(:last-child) {
        td {
          border-bottom: 1px solid ${theme.borderColor.tertiary};
        }
      }

      &:last-child {
        td {
          &:first-child {
            border-bottom-left-radius: ${theme.borderRadius.default}px;
          }

          &:last-child {
            border-bottom-right-radius: ${theme.borderRadius.default}px;
          }
        }
      }
    }
  `}
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
