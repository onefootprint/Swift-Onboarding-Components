import styled, { css } from 'styled-components';

const Table = styled.table`
  ${({ theme }) => css`
    border-collapse: separate;
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    width: 100%;

    thead {
      th {
        background: ${theme.backgroundColor.secondary};
        padding: ${theme.spacing[5]} ${theme.spacing[6]};
        border-bottom: 1px solid ${theme.borderColor.tertiary};
        vertical-align: middle;
        border-radius: ${theme.borderRadius.default}
          ${theme.borderRadius.default} 0 0;

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
        padding: ${theme.spacing[4]} ${theme.spacing[6]};
      }
    }
  `}
`;

export default Table;
