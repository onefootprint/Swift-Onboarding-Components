import Link from 'next/link';
import styled, { css } from 'styled-components';

export type LinkingButtonProps = {
  size?: 'default' | 'compact' | 'small' | 'large';
};

const LinkingButton = styled(Link)<LinkingButtonProps>`
  && {
    ${({ theme, size = 'default' }) => {
      const { button } = theme.components;

      return css`
        align-items: center;
        background-color: ${button.variant.primary.bg};
        border-color: ${button.variant.primary.borderColor};
        border-radius: ${button.global.borderRadius};
        border-style: solid;
        border-width: ${button.global.borderWidth};
        color: ${button.variant.primary.color};
        cursor: pointer;
        display: flex;
        font: ${button.size[size].typography};
        height: ${button.size[size].height};
        justify-content: center;
        outline-offset: ${theme.spacing[2]};
        padding: 0 ${button.size[size].paddingHorizontal};
        text-decoration: none;
        user-select: none;

        @media (hover: hover) {
          &:hover:enabled {
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
