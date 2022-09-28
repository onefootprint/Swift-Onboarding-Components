import 'styled-components';

import { Theme } from '@onefootprint/themes';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
