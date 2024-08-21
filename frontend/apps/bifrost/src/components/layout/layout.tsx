import type { FootprintVariant } from '@onefootprint/footprint-js';
import { Layout as AppLayout, useFootprintProvider } from '@onefootprint/idv';
import type React from 'react';

import { useBifrostMachine } from '../bifrost-machine-provider';

type LayoutProps = {
  children: React.ReactNode;
  variant?: FootprintVariant;
};

const Layout = ({ children, variant }: LayoutProps) => {
  const footprint = useFootprintProvider();
  const [state] = useBifrostMachine();
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
      config={config}
      onClose={handleClose}
    >
      {children}
    </AppLayout>
  );
};

export default Layout;
