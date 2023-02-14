import { Layout } from '@onefootprint/footprint-elements';
import React from 'react';

import useSandboxMode from '../../hooks/use-sandbox-mode';

export const HANDOFF_CONTAINER_ID = 'handoff-container-id';

type LayoutProps = {
  children: React.ReactNode;
};

const HandoffLayout = ({ children }: LayoutProps) => {
  const { isSandbox } = useSandboxMode();

  return (
    <Layout isSandbox={isSandbox} footerVariant="mobile">
      {children}
    </Layout>
  );
};

export default HandoffLayout;
