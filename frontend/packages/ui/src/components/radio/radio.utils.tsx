import type {
  BackgroundColor,
  Color,
  Overlay,
} from '@onefootprint/design-tokens';
import { css } from 'styled-components';

import { createOverlayBackground } from '../../utils/mixins';

type CreatePseudoStyles = {
  hoverOverlay: Overlay;
  activeOverlay: Overlay;
  background: BackgroundColor;
};

export const createPseudoStyles = ({
  hoverOverlay,
  activeOverlay,
  background,
}: CreatePseudoStyles) => css`
  @media (hover: hover) {
    &:hover:enabled {
      ${createOverlayBackground(hoverOverlay, background)};
    }
  }

  &:active:enabled {
    ${createOverlayBackground(activeOverlay, background)};
  }
`;

export const createCheckedStyled = (color: Color) => css`
  ${({ theme }) => css`
    content: '';
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: ${theme.color[color]};
    width: 6px;
    height: 6px;
    border-radius: 50%;
  `}
`;
