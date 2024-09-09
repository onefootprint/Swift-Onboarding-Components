import { Stack, createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const ComponentNameBadge = styled(Stack)<{ className?: string }>`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.secondary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    color: ${theme.color.tertiary};
    width: fit-content;
    padding: ${theme.spacing[1]} ${theme.spacing[3]};
    white-space: nowrap;
    box-shadow: ${theme.elevation[1]};
    z-index: 1;
  `}
`;

export default ComponentNameBadge;
