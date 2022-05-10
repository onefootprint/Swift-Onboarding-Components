import * as styledComponents from 'styled-components';

import type { DefaultTheme } from '../../config/types';

const {
  default: styled,
  createGlobalStyle,
  css,
  keyframes,
  ServerStyleSheet,
  ThemeProvider,
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
