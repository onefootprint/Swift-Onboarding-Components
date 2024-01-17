import '../../../../config/initializers/i18next-test';

import { ToastProvider } from '@onefootprint/ui';
import type { ReactNode } from 'react';
import React from 'react';
import { MachineProvider } from 'src/plugins/collect-kyc-data/components/machine-provider';
import type { MachineContext } from 'src/plugins/collect-kyc-data/utils/state-machine';

import { Layout } from '../../../../components';

type TestWrapperProps = {
  initialContext: MachineContext;
  initState: string;
  children: ReactNode;
};

const TestWrapper = ({
  initialContext,
  initState,
  children,
}: TestWrapperProps) => (
  <ToastProvider>
    <Layout>
      <MachineProvider initialContext={initialContext} initState={initState}>
        {children}
      </MachineProvider>
    </Layout>
  </ToastProvider>
);

export default TestWrapper;
