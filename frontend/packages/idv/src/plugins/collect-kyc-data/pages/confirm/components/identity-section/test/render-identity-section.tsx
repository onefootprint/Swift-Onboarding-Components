import '@/idv/config/initializers/i18next-test';

import { MachineProvider } from '@/idv/plugins/collect-kyc-data/components/machine-provider';
import type { InitMachineArgs } from '@/idv/plugins/collect-kyc-data/utils/state-machine/machine';
import { customRender } from '@onefootprint/test-utils';
import { ToastProvider } from '@onefootprint/ui';

import { Layout } from '@/idv/components';
import IdentitySection from '../identity-section';

export const renderIdentitySection = (initialContext: InitMachineArgs): ReturnType<typeof customRender> =>
  customRender(
    <ToastProvider>
      <Layout>
        <MachineProvider initialContext={initialContext} initState="confirm">
          <IdentitySection />
        </MachineProvider>
      </Layout>
    </ToastProvider>,
  );

export * from '@onefootprint/test-utils';
