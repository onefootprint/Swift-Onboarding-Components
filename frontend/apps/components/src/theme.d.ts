import 'styled-components';

import { Theme } from '@onefootprint/design-tokens';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
