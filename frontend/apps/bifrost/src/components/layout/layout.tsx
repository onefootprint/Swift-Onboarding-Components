import {
  Layout as AppLayout,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import React from 'react';
import useTenantPublicKey from 'src/hooks/use-tenant-public-key';

import { useBifrostMachine } from '../bifrost-machine-provider';
import useGetBifrostAppearance from './hooks/use-get-bifrost-appearance';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const footprint = useFootprintProvider();
  const [state] = useBifrostMachine();
  const tenantPk = useTenantPublicKey();
  const { config } = state.context;
  const isSandbox = config?.isLive === false;
  const appearance = useGetBifrostAppearance();

  return (
    <AppLayout
      options={{ hasDesktopBorderRadius: true }}
      isSandbox={isSandbox}
      appearance={appearance}
      tenantPk={tenantPk}
      onClose={footprint.cancel}
    >
      {children}
    </AppLayout>
  );
};

export default Layout;
