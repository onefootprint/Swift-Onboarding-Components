import { Layout } from '@onefootprint/footprint-elements';
import React from 'react';
import useSandboxMode from 'src/hooks/use-sandbox-mode';

export const BIFROST_CONTAINER_ID = 'bifrost-container-id';

type LayoutProps = {
  children: React.ReactNode;
};

const BifrostLayout = ({ children }: LayoutProps) => {
  const { isSandbox } = useSandboxMode();

  return (
    <Layout hasSandboxBanner={isSandbox} hasBorderRadius>
      {children}
    </Layout>
  );
};

export default BifrostLayout;
