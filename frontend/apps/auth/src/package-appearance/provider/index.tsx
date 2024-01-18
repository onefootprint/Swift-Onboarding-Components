import type { Theme } from '@onefootprint/design-tokens';
import type { FootprintAppearance } from '@onefootprint/footprint-js';
import { DesignSystemProvider } from '@onefootprint/ui';
import React from 'react';

import AppearanceContext from '../context';
import LoadAppearanceInBrowser from '../load-appearance-in-browser';
import LoadRules from '../load-rules';
import type { AppearanceOptions } from '../types';

type AppearanceProviderProps =
  | {
      appearance?: never;
      children: React.ReactNode;
      options?: AppearanceOptions;
      rules?: never;
      theme?: never;
    }
  | {
      appearance: FootprintAppearance;
      children: React.ReactNode;
      options?: never;
      rules: string;
      theme: Theme;
    };

const AppearanceProvider = ({
  appearance,
  children,
  options,
  rules,
  theme,
}: AppearanceProviderProps): JSX.Element | null => {
  if (theme) {
    return (
      <DesignSystemProvider theme={theme}>
        <LoadRules rules={rules} />
        <AppearanceContext.Provider value={appearance}>
          {children}
        </AppearanceContext.Provider>
      </DesignSystemProvider>
    );
  }

  if (options) {
    return (
      <LoadAppearanceInBrowser options={options}>
        {children}
      </LoadAppearanceInBrowser>
    );
  }

  return null;
};

export default AppearanceProvider;
