import 'styled-components';

import { Theme } from './packages/ui/src/config/themes/types';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
