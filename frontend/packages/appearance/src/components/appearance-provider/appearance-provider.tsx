import type { Theme } from '@onefootprint/design-tokens';
import type { FootprintAppearance } from '@onefootprint/footprint-js';
import { DesignSystemProvider } from '@onefootprint/ui';
import React from 'react';

import type { AppearanceOptions } from '../../appearence.types';
import AppearanceContext from './appearance-context';
import LoadAppearanceInBrowser from './components/load-appearance-in-browser';
import LoadRules from './components/load-rules';

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

const AppearanceProvider = ({ appearance, children, options, rules, theme }: AppearanceProviderProps) => {
  if (theme) {
    return (
      <DesignSystemProvider theme={theme}>
        <LoadRules rules={rules} />
        <AppearanceContext.Provider value={appearance}>{children}</AppearanceContext.Provider>
      </DesignSystemProvider>
    );
  }

  if (options) {
    return <LoadAppearanceInBrowser options={options}>{children}</LoadAppearanceInBrowser>;
  }

  return null;
};

export default AppearanceProvider;
