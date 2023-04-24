import { Layout } from '@onefootprint/idv-elements';
import React from 'react';

import { IdvLayout } from '../../types';
import { useIdvMachine } from '../machine-provider';
import useSandboxMode from './hooks/use-sandbox-mode';

type IdvLayoutProps = {
  children: React.ReactNode;
  options: IdvLayout;
  onClose: () => void;
};

const AppLayout = ({ children, options, onClose }: IdvLayoutProps) => {
  const isSandbox = useSandboxMode();
  const [state] = useIdvMachine();
  const { tenantPk } = state.context;

  return (
    <Layout
      tenantPk={tenantPk}
      isSandbox={isSandbox}
      options={options}
      onClose={onClose}
    >
      {children}
    </Layout>
  );
};

export default AppLayout;
