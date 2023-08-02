import styled, { css } from '@onefootprint/styled';
import { createTypography } from '@onefootprint/ui';
import Link from 'next/link';

export type LinkingButtonProps = {
  size?: 'default' | 'compact' | 'small' | 'large';
};

const LinkingButton = styled(Link)<LinkingButtonProps>`
  && {
    ${({ theme, size = 'default' }) => {
      const { button } = theme.components;

      return css`
        ${createTypography(button.size[size].typography)}
        align-items: center;
        background-color: ${button.variant.primary.bg};
        border-color: ${button.variant.primary.borderColor};
        border-radius: ${button.borderRadius};
        border-style: solid;
        border-width: ${button.borderWidth};
        color: ${button.variant.primary.color};
        cursor: pointer;
        display: flex;
        height: ${button.size[size].height};
        justify-content: center;
        outline-offset: ${theme.spacing[2]};
        padding: 0 ${button.size[size].paddingHorizontal};
        text-decoration: none;
        user-select: none;

        @media (hover: hover) {
          &:hover {
            background-color: ${button.variant.primary.hover.bg};
            border-color: ${button.variant.primary.hover.borderColor};
            color: ${button.variant.primary.hover.color};
          }
        }
      `;
    }}
  }
`;

export default LinkingButton;
