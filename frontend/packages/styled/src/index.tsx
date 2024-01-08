import type { Theme } from '@onefootprint/design-tokens';
import * as styledComponents from 'styled-components';

const {
  default: styled,
  css,
  useTheme,
  ThemeProvider,
  keyframes,
  createGlobalStyle,
  ServerStyleSheet,
} = styledComponents as unknown as styledComponents.ThemedStyledComponentsModule<Theme>;

export {
  createGlobalStyle,
  css,
  keyframes,
  ServerStyleSheet,
  ThemeProvider,
  useTheme,
};
export default styled;
