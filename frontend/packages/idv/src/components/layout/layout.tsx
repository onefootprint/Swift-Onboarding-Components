import { Layout } from '@onefootprint/idv-elements';
import React from 'react';

import { IdvLayout } from '../../types';
import { useIdvMachine } from '../machine-provider';
import useSandboxMode from './hooks/use-sandbox-mode';

type IdvLayoutProps = {
  children: React.ReactNode;
  options?: IdvLayout;
};

const AppLayout = ({ children, options }: IdvLayoutProps) => {
  const isSandbox = useSandboxMode();
  const [state] = useIdvMachine();
  const { tenantPk, onClose } = state.context;

  return tenantPk ? (
    <Layout
      tenantPk={tenantPk}
      isSandbox={isSandbox}
      options={options}
      onClose={onClose}
    >
      {children}
    </Layout>
  ) : null;
};

export default AppLayout;
