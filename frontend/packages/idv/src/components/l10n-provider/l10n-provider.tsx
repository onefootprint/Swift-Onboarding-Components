import type { L10n } from '@onefootprint/footprint-js';
import React, { createContext, useContext } from 'react';

export type L10nContextProviderProps = {
  children: React.ReactNode;
  l10n?: L10n;
};

export const L10nContext = createContext<L10n | undefined>({ locale: 'en-US' });
export const useL10nContext = () => useContext(L10nContext);
export const L10nContextProvider = ({ children, l10n }: L10nContextProviderProps): JSX.Element => (
  <L10nContext.Provider value={l10n}>{children}</L10nContext.Provider>
);
