import type { UIState } from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import type { SXStyleProps } from '@onefootprint/ui';
import React from 'react';

import { createFontStyles } from '../../utils/mixins';

export type BadgeProps = {
  children: React.ReactNode;
  testID?: string;
  variant: UIState;
  sx?: SXStyleProps;
};

const Badge = ({ children, testID, variant, sx }: BadgeProps) => (
  <StyledBadge $variant={variant} $sx={sx} data-testid={testID}>
    {children}
  </StyledBadge>
);

const StyledBadge = styled.span<{
  $variant: UIState;
  $sx?: SXStyleProps;
}>`
  ${({ theme, $variant, $sx }) => css`
    ${createFontStyles('caption-1')};
    align-items: center;
    background-color: ${theme.backgroundColor[$variant]};
    border-radius: ${theme.borderRadius.large};
    border: 0;
    color: ${theme.color[$variant]};
    display: inline-flex;
    justify-content: center;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    ${$sx};
  `}
`;

export default Badge;
