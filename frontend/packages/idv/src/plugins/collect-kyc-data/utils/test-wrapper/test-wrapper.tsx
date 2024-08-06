import '../../../../config/initializers/i18next-test';

import { ToastProvider } from '@onefootprint/ui';
import type { ReactNode } from 'react';
import { MachineProvider } from 'src/plugins/collect-kyc-data/components/machine-provider';

import { Layout } from '../../../../components';
import type { InitMachineArgs } from '../state-machine/machine';

type TestWrapperProps = {
  initialContext: InitMachineArgs;
  initState: string;
  children: ReactNode;
};

const TestWrapper = ({ initialContext, initState, children }: TestWrapperProps) => (
  <ToastProvider>
    <Layout>
      <MachineProvider initialContext={initialContext} initState={initState}>
        {children}
      </MachineProvider>
    </Layout>
  </ToastProvider>
);

export default TestWrapper;
