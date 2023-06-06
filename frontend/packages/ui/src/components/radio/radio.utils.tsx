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
    background-color: ${theme.color[color]};
    transform: scale(1);
    clip-path: circle(42% at 50%);
  `}
`;
