import {
  BackgroundColor,
  FontVariant,
  Overlay,
} from '@onefootprint/design-tokens';
import { css } from 'styled-components';

export const createTypography = (typography: {
  fontFamily: string;
  fontWeight: number;
  lineHeight: string;
  fontSize: string;
}) => css`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize};
  font-weight: ${typography.fontWeight};
  line-height: ${typography.lineHeight};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

export const createFontStyles = (variant: FontVariant) => css`
  ${({ theme }) => css`
    font-family: ${theme.typography[variant].fontFamily};
    font-size: ${theme.typography[variant].fontSize};
    font-weight: ${theme.typography[variant].fontWeight};
    line-height: ${theme.typography[variant].lineHeight};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
