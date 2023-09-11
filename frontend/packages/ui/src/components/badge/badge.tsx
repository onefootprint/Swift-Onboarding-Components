import type { UIState } from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import type React from 'react';

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
    border-radius: ${theme.borderRadius.large};
    border: 0;
    color: ${theme.color[variant]};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    text-decoration: none;
    text-transform: capitalize;
    display: flex;
    justify-content: center;
    align-items: center;
    width: min-content;
  `}
`;

export default Badge;
