import type { FootprintVariant } from '@onefootprint/footprint-js';
import { Layout as AppLayout } from '@onefootprint/idv';
import type React from 'react';

import { useHandoffMachine } from '../machine-provider';

type LayoutProps = {
  children: React.ReactNode;
  variant?: FootprintVariant;
};

const Layout = ({ children, variant }: LayoutProps) => {
  const [state] = useHandoffMachine();
  const { onboardingConfig } = state.context;
  const isSandbox = onboardingConfig?.isLive === false;

  return (
    <AppLayout variant={variant} isSandbox={isSandbox} config={onboardingConfig}>
      {children}
    </AppLayout>
  );
};

export default Layout;
