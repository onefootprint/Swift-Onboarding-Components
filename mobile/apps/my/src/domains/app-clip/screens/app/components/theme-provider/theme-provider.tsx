import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import React from 'react';

import useExtendedAppearance from './hooks/use-extended-appearance';

type ThemeProviderProps = {
  authToken: string;
  children: React.ReactNode;
};

const ThemeProvider = ({ authToken, children }: ThemeProviderProps) => {
  const query = useExtendedAppearance(authToken);
  if (query.isLoading) {
    return null;
  }
  const theme = query.data || themes.light;
  return <DesignSystemProvider theme={theme}>{children}</DesignSystemProvider>;
};

export default ThemeProvider;
