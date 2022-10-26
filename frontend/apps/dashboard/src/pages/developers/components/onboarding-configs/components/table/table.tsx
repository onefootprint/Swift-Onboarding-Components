import styled, { css } from 'styled-components';

const Table = styled.table`
  ${({ theme }) => css`
    border-collapse: separate;
    border-radius: ${theme.borderRadius.default}px;
    border: 1px solid ${theme.borderColor.tertiary};
    width: 100%;

    thead {
      th {
        background: ${theme.backgroundColor.secondary};
        padding: ${theme.spacing[5]}px ${theme.spacing[6]}px;
        border-bottom: 1px solid ${theme.borderColor.tertiary};
        vertical-align: middle;
        border-radius: ${theme.borderRadius.default}px
          ${theme.borderRadius.default}px 0 0;

        &:first-child {
          text-align: left;
        }

        &:last-child {
          text-align: right;
        }
      }
    }

    tbody {
      tr:not(:last-child) td {
        border-bottom: 1pt solid ${theme.borderColor.tertiary};
      }

      td {
        vertical-align: middle;
        padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
      }
    }
  `}
`;

export default Table;
