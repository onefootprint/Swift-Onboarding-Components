import {
  Layout as AppLayout,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import { useRouter } from 'next/router';
import React from 'react';
import useTenantPublicKey from 'src/hooks/use-tenant-public-key';

import { useBifrostMachine } from '../bifrost-machine-provider';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const footprint = useFootprintProvider();
  const [state] = useBifrostMachine();
  const tenantPk = useTenantPublicKey();
  const { config } = state.context;
  const isSandbox = config?.isLive === false;

  const router = useRouter();
  const searchParams = new URLSearchParams(router.asPath);
  const fontSrc = searchParams.get('font_src') ?? undefined;
  const variables = searchParams.get('tokens') ?? undefined;
  const rules = searchParams.get('rules') ?? undefined;
  const appearance = { fontSrc, rules, variables };

  return (
    <AppLayout
      options={{ hasDesktopBorderRadius: true }}
      isSandbox={isSandbox}
      appearance={appearance}
      tenantPk={tenantPk}
      onClose={footprint.close}
    >
      {children}
    </AppLayout>
  );
};

export default Layout;
