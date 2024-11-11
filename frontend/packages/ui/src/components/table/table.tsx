import { IcoInfo16 } from '@onefootprint/icons';
import type { Property } from 'csstype';
import times from 'lodash/times';
import type React from 'react';
import styled, { css } from 'styled-components';

import type * as CSS from 'csstype';
import { createFontStyles } from '../../utils';
import type { LabelTooltipProps } from '../label';
import Shimmer from '../shimmer';
import Stack from '../stack';
import Text from '../text';
import Tooltip from '../tooltip';
import TableFilters from './components/table-filters';

export type TableRow<T> = {
  item: T;
  index: Number;
};

export type TableProps<T> = {
  'aria-label': string;
  columns: {
    id?: string;
    text: string;
    width?: Property.Width;
    tooltip?: LabelTooltipProps;
    justifyContent?: CSS.Property.JustifyContent;
  }[];
  emptyStateText?: string;
  getKeyForRow: (item: T) => string;
  getAriaLabelForRow?: (item: T) => string;
  hideThead?: boolean;
  initialSearch?: string;
  isLoading?: boolean;
  items?: Array<T>;
  onChangeSearchText?: (text: string) => void;
  onRowClick?: (item: T, event: React.MouseEvent<HTMLTableRowElement>) => void;
  renderActions?: () => React.ReactNode;
  renderSubActions?: () => React.ReactNode;
  renderTr: (row: TableRow<T>) => JSX.Element;
  hasRowEmphasis?: (item: T) => boolean;
  searchPlaceholder?: string;
};

const Table = <T,>({
  'aria-label': ariaLabel,
  columns,
  emptyStateText = 'No results',
  getKeyForRow,
  getAriaLabelForRow,
  hideThead,
  initialSearch,
  isLoading,
  items,
  onChangeSearchText,
  onRowClick,
  renderActions,
  renderSubActions,
  renderTr,
  hasRowEmphasis,
  searchPlaceholder = 'Search...',
}: TableProps<T>) => {
  const shouldRenderFilters = onChangeSearchText || renderActions || renderSubActions;
  const shouldShowEmptyState = !isLoading && !items?.length;
  const shouldShowData = !isLoading && !!items;
  const columnsCount = columns.length;

  return (
    <>
      {shouldRenderFilters && (
        <Stack marginBottom={4} flexDirection="column" gap={5}>
          {(onChangeSearchText || renderActions) && (
            <TableFilters
              initialValue={initialSearch}
              onChangeText={onChangeSearchText}
              placeholder={searchPlaceholder}
            >
              {renderActions?.()}
            </TableFilters>
          )}
          {renderSubActions?.()}
        </Stack>
      )}
      <TableContainer aria-live="polite" aria-busy={isLoading} aria-label={ariaLabel}>
        <colgroup>
          {columns.map(column => (
            <col key={column.id || column.text} style={{ width: column.width }} />
          ))}
        </colgroup>
        {hideThead ? null : (
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.id || column.text}>
                  <TooltipContainer justifyContent={column.justifyContent}>
                    {column.text}
                    {column?.tooltip && (
                      <Tooltip text={column.tooltip.text} alignment="end" position="bottom">
                        <InfoButton aria-label={column.tooltip?.triggerAriaLabel ?? column?.tooltip.text}>
                          <IcoInfo16 />
                        </InfoButton>
                      </Tooltip>
                    )}
                  </TooltipContainer>
                </th>
              ))}
            </tr>
          </thead>
        )}
        {isLoading ? (
          <tbody>
            {times(2).map(() => (
              <tr key={Math.random()}>
                {times(columnsCount).map(() => (
                  <td key={Math.random()} aria-label="shimmer">
                    <Shimmer aria-hidden height="24px" width="100%" />
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
                  <Text variant="body-3">{emptyStateText}</Text>
                </td>
              </EmptyTr>
            )}
            {shouldShowData &&
              items.map((item: T, index: Number) => (
                <Tr
                  aria-label={getAriaLabelForRow ? getAriaLabelForRow(item) : getKeyForRow(item)}
                  data-clickable={!!onRowClick}
                  key={getKeyForRow(item)}
                  onClick={event => {
                    onRowClick?.(item, event);
                  }}
                  color={hasRowEmphasis?.(item) ? 'warning' : undefined}
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
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    table-layout: fixed;
    text-align: left;
    overflow: hidden;
    width: 100%;

    th {
      ${createFontStyles('caption-3')};
      background: ${theme.backgroundColor.secondary};
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      color: ${theme.color.secondary};
      padding: ${theme.spacing[4]} ${theme.spacing[4]};
      text-transform: uppercase;

      &:first-child {
        border-top-left-radius: ${theme.borderRadius.default};
        padding-left: ${theme.spacing[6]};
      }

      &:last-child {
        border-top-right-radius: ${theme.borderRadius.default};
        padding-right: ${theme.spacing[6]};
      }
    }

    td {
      ${createFontStyles('body-3')};
      color: ${theme.color.primary};
      height: 46px;
      padding: 0 ${theme.spacing[4]};
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      p {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
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
            border-bottom-left-radius: ${theme.borderRadius.default};
          }

          &:last-child {
            border-bottom-right-radius: ${theme.borderRadius.default};
          }
        }
      }

      td {
        &:first-child {
          padding-left: ${theme.spacing[6]};
        }

        &:last-child {
          padding-right: ${theme.spacing[6]};
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

      @media (hover: hover) {
        &:hover {
          background-color: ${theme.backgroundColor.secondary};
        }
      }
    }
  `}
`;

const InfoButton = styled.button`
  margin: 0;
  padding: 0;
  background: none;
  border: none;
  display: inherit;
`;

const EmptyTr = styled.tr`
  td {
    text-align: left;
  }
`;

const TooltipContainer = styled.div<{ justifyContent?: CSS.Property.JustifyContent }>`
  ${({ theme, justifyContent = 'flex-start' }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: ${justifyContent};
    white-space: nowrap;
    gap: ${theme.spacing[3]};
  `}
`;
export default Table;
