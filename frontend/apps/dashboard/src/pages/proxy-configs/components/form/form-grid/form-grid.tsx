import styled, { css } from 'styled-components';

const FormGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[7]};

    > div:not(:last-child) {
      padding-bottom: ${theme.spacing[7]};
      border-bottom: 1px solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default FormGrid;
