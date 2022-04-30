import * as styledComponents from 'styled-components';

import type { DefaultTheme } from '../../config/types';

const {
  default: styled,
  css,
  createGlobalStyle,
  keyframes,
  ThemeProvider,
  ServerStyleSheet,
  useTheme,
} = styledComponents as styledComponents.ThemedStyledComponentsModule<DefaultTheme>;

export {
  createGlobalStyle,
  css,
  keyframes,
  ServerStyleSheet,
  ThemeProvider,
  useTheme,
};

export default styled;
