import {
  BackgroundColor,
  FontVariant,
  Overlay,
} from '@onefootprint/design-tokens';
import { css } from 'styled-components';

export const createFontStyles = (variant: FontVariant) => css`
  ${({ theme }) => css`
    font: ${theme.typography[variant]};
  `}
`;

export const createOverlayBackground = (
  overlay: Overlay,
  background: BackgroundColor,
) => css`
  ${({ theme }) => css`
    background: linear-gradient(
        ${theme.overlay[overlay]},
        ${theme.overlay[overlay]}
      ),
      linear-gradient(
        ${theme.backgroundColor[background]},
        ${theme.backgroundColor[background]}
      );
  `}
`;
