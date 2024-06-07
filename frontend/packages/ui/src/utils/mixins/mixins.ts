import type {
  BackgroundColor,
  DeprecatedTypography,
  FontFamily,
  FontVariant,
  Overlay,
  Typography,
} from '@onefootprint/design-tokens';
import type * as CSS from 'csstype';
import { css } from 'styled-components';

export const createFontStyles = (variant: FontVariant, fontFamily: FontFamily = 'default') => css`
  ${({ theme }) => css`
    font-family: ${theme.fontFamily[fontFamily]};
    font-weight: ${theme.typography[variant].fontWeight};
    font-size: ${theme.typography[variant].fontSize};
    line-height: ${theme.typography[variant].lineHeight};
  `}
`;

const convertDeprecatedTypography = (typography: DeprecatedTypography): Typography => {
  const parts = typography.split(' ');
  if (parts.length < 2) {
    throw new Error('Invalid typography');
  }
  const fontWeight = parseInt(parts[0], 10) as CSS.Property.FontWeight;
  const [fontSize, lineHeight] = parts[1].split('/');
  return {
    fontWeight,
    fontSize: fontSize as CSS.Property.FontSize,
    lineHeight: lineHeight as CSS.Property.LineHeight,
  };
};

export const createText = (typography: Typography | DeprecatedTypography) => {
  const resolvedTypography = typeof typography === 'string' ? convertDeprecatedTypography(typography) : typography;

  return {
    fontFamily: 'inherit',
    fontWeight: resolvedTypography.fontWeight,
    fontSize: resolvedTypography.fontSize,
    lineHeight: resolvedTypography.lineHeight,
  };
};

export const createOverlayBackground = (overlay: Overlay, background: BackgroundColor) => css`
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
