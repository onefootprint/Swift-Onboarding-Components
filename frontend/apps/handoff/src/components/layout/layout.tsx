import { Layout as AppLayout } from '@onefootprint/idv-elements';
import React from 'react';

import { useHandoffMachine } from '../machine-provider';
import useGetHandoffAppearance from './hooks/use-get-handoff-appearance';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [state] = useHandoffMachine();
  const { onboardingConfig } = state.context;
  const isSandbox = onboardingConfig?.isLive === false;
  const { key } = onboardingConfig ?? {};
  const appearance = useGetHandoffAppearance();

  return (
    <AppLayout
      tenantPk={key}
      isSandbox={isSandbox}
      options={{ fixContainerSize: true }}
      appearance={appearance}
    >
      {children}
    </AppLayout>
  );
};

export default Layout;
