import type { Theme } from '@onefootprint/design-tokens';
import { FootprintAppearance } from '@onefootprint/footprint-js';
import { DesignSystemProvider } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';

import type { AppearanceOptions } from '../../../../appearence.types';
import getCustomAppearance from '../../../../utils/get-custom-appearance';
import AppearanceContext from '../../appearance-context';

type LoadAppearanceInBrowserProps = {
  options: AppearanceOptions;
  children: React.ReactNode;
};

const LoadAppearanceInBrowser = ({
  options,
  children,
}: LoadAppearanceInBrowserProps) => {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [appearance, setAppearance] = useState<FootprintAppearance | null>(
    null,
  );

  const getAuthToken = () => {
    const url = new URL(window.location.href);
    return url.hash.substring(1);
  };

  const getAppearance = async () => {
    const response = await getCustomAppearance({
      ...options,
      authToken: getAuthToken(),
    });
    setTheme(response.theme);
    setAppearance(response.appearance);
  };

  useEffect(() => {
    getAppearance();
  }, []);

  return theme ? (
    <DesignSystemProvider theme={theme}>
      <AppearanceContext.Provider value={appearance}>
        {children}
      </AppearanceContext.Provider>
    </DesignSystemProvider>
  ) : null;
};

export default LoadAppearanceInBrowser;
