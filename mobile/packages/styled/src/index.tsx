import { Theme } from '@onefootprint/design-tokens';
import * as styledComponents from 'styled-components/native';

const {
  default: styled,
  css,
  useTheme,
  ThemeProvider,
} = styledComponents as unknown as styledComponents.ReactNativeThemedStyledComponentsModule<Theme>;

export { css, ThemeProvider, useTheme };
export default styled;
