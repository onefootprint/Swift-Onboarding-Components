import type { CustomChildAPI } from '@onefootprint/idv';
import type React from 'react';
import { createContext, useContext } from 'react';

import type { ProviderReturn } from './types';

type FootprintProviderProps = {
  children: React.ReactNode;
  client: ProviderReturn;
};

const NotImplemented = 'Function not implemented.';
const FootprintContext = createContext<ProviderReturn>({
  getAdapterResponse(): CustomChildAPI | null {
    throw new Error(NotImplemented);
  },
  getLoadingStatus(): boolean {
    throw new Error(NotImplemented);
  },
  load(): Promise<CustomChildAPI | null> {
    throw new Error(NotImplemented);
  },
  on(): () => void {
    throw new Error(NotImplemented);
  },
  send(): void {
    throw new Error(NotImplemented);
  },
});

const FootprintProvider = ({ children, client }: FootprintProviderProps): JSX.Element => (
  <FootprintContext.Provider value={client}>{children}</FootprintContext.Provider>
);

export default FootprintProvider;
export const useFootprintProvider = () => useContext(FootprintContext);
