/* eslint-disable react/jsx-props-no-spreading */
import type { UIState } from '@onefootprint/design-tokens';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { BoxProps } from '../box';
import Box from '../box';

export type BadgeProps = BoxProps & {
  variant: UIState;
};

const Badge = ({ children, variant, ...props }: BadgeProps) => (
  <StyledBadge $variant={variant} tag="span" {...props}>
    {children}
  </StyledBadge>
);

const StyledBadge = styled(Box)<{
  $variant: UIState;
}>`
  ${({ theme, $variant }) => css`
    ${createFontStyles('caption-1')};
    align-items: center;
    background-color: ${theme.backgroundColor[$variant]};
    border-radius: ${theme.borderRadius.xl};
    border: 0;
    color: ${theme.color[$variant]};
    display: inline-flex;
    justify-content: center;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
  `}
`;

export default Badge;
