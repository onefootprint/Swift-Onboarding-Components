import React from 'react';
import styled, { css } from 'styled';
import { LoadingIndicator } from 'ui';

export type Row<T> = {
  item: T;
  i: Number;
};

export type TableProps<T> = {
  renderHeader: () => JSX.Element;
  renderRow: (row: Row<T>) => JSX.Element;
  getKeyForRow: (item: T) => any;
  items?: Array<T>;
  isLoading?: boolean;
};

const Table = <T,>({
  renderHeader,
  renderRow,
  getKeyForRow,
  items,
  isLoading,
}: TableProps<T>) => (
  <TableContainer>
    <thead>
      <Tr>{renderHeader()}</Tr>
    </thead>
    <tbody>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        items &&
        items.map((item: T, i: Number) => (
          <Tr key={getKeyForRow(item)}>{renderRow({ i, item })}</Tr>
        ))
      )}
    </tbody>
  </TableContainer>
);

export default Table;

const TableContainer = styled.table`
  width: 100%;
  border-collapse: separate;
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[2]}px;
  `};

  ${({ theme }) => css`
    tbody tr:last-child td:first-child {
      border-bottom-left-radius: ${theme.borderRadius[1]}px;
    }

    tbody tr:last-child td:last-child {
      border-bottom-right-radius: ${theme.borderRadius[1]}px;
    }

    tr td:first-child {
      border-left: 1px solid ${theme.borderColor.tertiary};
    }

    tr td:last-child {
      border-right: 1px solid ${theme.borderColor.tertiary};
    }

    td {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
    }
  `}
`;

const Tr = styled.tr`
  transition: 0.1s;
  ${({ theme }) => css`
    :hover {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

export const Th = styled.td`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
    background-color: ${theme.backgroundColor.secondary};
  `}
`;
