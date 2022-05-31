import React from 'react';
import styled, { css, UIState } from 'styled';

import { createFontStyles } from '../../utils/mixins';

export type BadgeProps = {
  children: React.ReactNode;
  testID?: string;
  variant: UIState;
};

const Badge = styled.span.attrs<BadgeProps>(({ testID }) => ({
  'data-testid': testID,
}))<BadgeProps>`
  ${({ theme, variant }) => css`
    ${createFontStyles('caption-1')};
    background-color: ${theme.backgroundColor[variant]};
    border-radius: ${theme.borderRadius[2]}px;
    border: 0;
    color: ${theme.color[variant]};
    padding: ${theme.spacing[2]}px ${theme.spacing[3]}px;
    text-decoration: none;
  `}
`;

export default Badge;
