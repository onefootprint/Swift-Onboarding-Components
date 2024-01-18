import type { Theme } from '@onefootprint/design-tokens';
import type { FootprintAppearance } from '@onefootprint/footprint-js';
import { HostedUrlType } from '@onefootprint/types';
import { DesignSystemProvider } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';

import AppearanceContext from '../context';
import { getCustomAppearanceFork } from '../index';
import type { AppearanceOptions } from '../types';

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

  const getKybBoAuthToken = () => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const type = params.get('type');
    if (type) {
      return undefined;
    }
    if (type === HostedUrlType.beneficialOwner) {
      return url.hash.substring(1);
    }
    return undefined;
  };

  const getAppearance = async () => {
    const response = await getCustomAppearanceFork({
      ...options,
      authToken: getAuthToken(),
      kybBoAuthToken: getKybBoAuthToken(),
    });
    setTheme(response.theme);
    setAppearance(response.appearance);
  };

  useEffect(() => {
    getAppearance();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return theme ? (
    <DesignSystemProvider theme={theme}>
      <AppearanceContext.Provider value={appearance}>
        {children}
      </AppearanceContext.Provider>
    </DesignSystemProvider>
  ) : null;
};

export default LoadAppearanceInBrowser;
