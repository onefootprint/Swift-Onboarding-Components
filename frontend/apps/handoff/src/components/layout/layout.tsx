import type { FootprintVariant } from '@onefootprint/footprint-js';
import { Layout as AppLayout } from '@onefootprint/idv-elements';
import React from 'react';

import { useHandoffMachine } from '../machine-provider';

type LayoutProps = {
  children: React.ReactNode;
  variant?: FootprintVariant;
};

const Layout = ({ children, variant }: LayoutProps) => {
  const [state] = useHandoffMachine();
  const { onboardingConfig } = state.context;
  const isSandbox = onboardingConfig?.isLive === false;
  const { key } = onboardingConfig ?? {};

  return (
    <AppLayout variant={variant} tenantPk={key} isSandbox={isSandbox}>
      {children}
    </AppLayout>
  );
};

export default Layout;
