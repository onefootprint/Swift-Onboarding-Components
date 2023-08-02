import { Layout as AppLayout } from '@onefootprint/idv-elements';
import React from 'react';

import { useHandoffMachine } from '../machine-provider';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [state] = useHandoffMachine();
  const { onboardingConfig } = state.context;
  const isSandbox = onboardingConfig?.isLive === false;
  const { key } = onboardingConfig ?? {};

  return (
    <AppLayout tenantPk={key} isSandbox={isSandbox}>
      {children}
    </AppLayout>
  );
};

export default Layout;
