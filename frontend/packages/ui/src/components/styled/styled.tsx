import * as baseStyled from 'styled-components';
import type { DefaultTheme } from '../../config/themes/types';

export const {
  createGlobalStyle,
  css,
  default: styled,
  keyframes,
  ServerStyleSheet,
  ThemeProvider,
  useTheme,
} = baseStyled as unknown as baseStyled.ThemedStyledComponentsModule<DefaultTheme>;
