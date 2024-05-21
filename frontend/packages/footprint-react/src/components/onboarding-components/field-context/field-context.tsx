import type { FootprintUserData } from '@onefootprint/footprint-js';
import { createContext } from 'react';

export default createContext<{
  name: keyof FootprintUserData;
  id: string;
}>({
  // TODO: Improve
  name: 'id.address_line1',
  id: '',
});
