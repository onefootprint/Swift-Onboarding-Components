import React from 'react';
import styled, { css, UIState } from 'styled';

export type BadgeProps = {
  children: React.ReactNode;
  testID?: string;
  variant: UIState;
};

const Badge = styled.span.attrs<BadgeProps>(({ testID }) => ({
  'data-testid': testID,
}))<BadgeProps>`
  ${({ theme, variant }) => {
    const font = theme.typography['caption-1'];
    return css`
      background-color: ${theme.backgroundColor[variant]};
      border-radius: ${theme.borderRadius[2]}px;
      border: 0;
      color: ${theme.color[variant]};
      font-family: ${font.fontFamily};
      font-size: ${font.fontSize};
      font-weight: ${font.fontWeight};
      line-height: ${font.lineHeight};
      padding: ${theme.spacing[2]}px ${theme.spacing[3]}px;
      text-decoration: none;
    `;
  }}
`;

export default Badge;
