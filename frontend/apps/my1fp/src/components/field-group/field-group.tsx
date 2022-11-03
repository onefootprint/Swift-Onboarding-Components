import styled, { css } from 'styled-components';

const FieldGroup = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default FieldGroup;
