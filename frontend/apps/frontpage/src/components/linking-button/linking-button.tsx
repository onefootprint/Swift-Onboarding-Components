import type { FontVariant } from '@onefootprint/design-tokens';
import { createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import styled, { css } from 'styled-components';

export type LinkingButtonProps = {
  size?: 'default' | 'compact' | 'small' | 'large';
};

const LinkingButton = styled(Link)<LinkingButtonProps>`
  && {
    ${({ theme, size = 'default' }) => {
      const { button } = theme.components;
      const paddings = {
        large: `0 ${theme.spacing[5]}`,
        default: `0 ${theme.spacing[5]}`,
        compact: `0 ${theme.spacing[4]}`,
        small: `0 ${theme.spacing[3]}`,
      };
      const typographies = {
        large: 'label-2',
        default: 'label-2',
        compact: 'label-3',
        small: 'caption-1',
      };
      const heights = {
        large: '48px',
        default: '40px',
        compact: '32px',
        small: '26px',
      };
      return css`
        ${createFontStyles(typographies[size] as FontVariant)}
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: ${button.variant.primary.bg};
        border-radius: ${button.borderRadius};
        color: ${button.variant.primary.color};
        padding: ${paddings[size]};
        height: ${heights[size]};
        box-shadow: ${button.variant.primary.boxShadow};
        text-decoration: none;
        user-select: none;
        transition: all 0.2s;

        @media (hover: hover) {
          &:hover {
            background-color: ${button.variant.primary.hover.bg};
            border-color: ${button.variant.primary.hover.borderColor};
            color: ${button.variant.primary.hover.color};
            box-shadow: ${button.variant.primary.hover.boxShadow};
          }
        }

        &:active {
          background-color: ${button.variant.primary.active.bg};
          border-color: ${button.variant.primary.active.borderColor};
          color: ${button.variant.primary.active.color};
          box-shadow: ${button.variant.primary.active.boxShadow};
        }
      `;
    }}
  }
`;

export default LinkingButton;
