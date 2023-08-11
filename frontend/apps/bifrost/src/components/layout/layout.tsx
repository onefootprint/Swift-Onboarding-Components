import { FootprintVariant } from '@onefootprint/footprint-js';
import {
  Layout as AppLayout,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import React from 'react';
import useTenantPublicKey from 'src/hooks/use-tenant-public-key';

import { useBifrostMachine } from '../bifrost-machine-provider';

type LayoutProps = {
  children: React.ReactNode;
  variant?: FootprintVariant;
};

const Layout = ({ children, variant }: LayoutProps) => {
  const footprint = useFootprintProvider();
  const [state] = useBifrostMachine();
  const tenantPk = useTenantPublicKey();
  const { config } = state.context;
  const isSandbox = config?.isLive === false;
  const handleClose = () => {
    footprint.cancel();
    footprint.close();
  };

  return (
    <AppLayout
      variant={variant}
      options={{ hasDesktopBorderRadius: true }}
      isSandbox={isSandbox}
      tenantPk={tenantPk}
      onClose={handleClose}
    >
      {children}
    </AppLayout>
  );
};

export default Layout;
