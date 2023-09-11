import 'styled-components';

import type { Theme } from '@onefootprint/design-tokens';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
