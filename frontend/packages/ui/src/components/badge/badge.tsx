import type { UIState } from '@onefootprint/design-tokens';
import type { SXStyleProps } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';

export type BadgeProps = {
  children: React.ReactNode;
  testID?: string;
  variant: UIState;
  sx?: SXStyleProps;
  className?: string;
};

const Badge = ({ children, testID, variant, sx, className }: BadgeProps) => (
  <StyledBadge
    $variant={variant}
    $sx={sx}
    data-testid={testID}
    className={className}
  >
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
    border-radius: ${theme.borderRadius.xl};
    border: 0;
    color: ${theme.color[$variant]};
    display: inline-flex;
    justify-content: center;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    ${$sx};
  `}
`;

export default Badge;
