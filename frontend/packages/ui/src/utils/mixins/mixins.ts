import {
  BackgroundColor,
  FontFamily,
  FontVariant,
  Overlay,
  Typography,
} from '@onefootprint/design-tokens';
import { css } from '@onefootprint/styled';

export const createFontStyles = (
  variant: FontVariant,
  fontFamily?: FontFamily,
) => css`
  ${({ theme }) => css`
    font-family: ${fontFamily ? theme.fontFamily[fontFamily] : 'inherit'};
    font-weight: ${theme.typography[variant].fontWeight};
    font-size: ${theme.typography[variant].fontSize};
    line-height: ${theme.typography[variant].lineHeight};
  `}
`;

export const createTypography = (typography: Typography) => ({
  fontFamily: 'inherit',
  fontSize: typography.fontSize,
  fontWeight: typography.fontWeight,
  lineHeight: typography.lineHeight,
});

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
