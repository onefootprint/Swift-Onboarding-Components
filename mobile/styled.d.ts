import 'styled-components/native';

import type { Theme } from '@onefootprint/design-tokens';

declare module 'styled-components/native' {
  export interface DefaultTheme extends Theme {}
}
