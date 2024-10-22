import { Stack } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const ExpressionContainer = styled(Stack)`
  ${({ theme }) => css`
    height: fit-content;
    min-width: fit-content;
    align-items: center;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[1]} ${theme.spacing[4]};
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.full};
    overflow: hidden;
  `}
`;

export default ExpressionContainer;
