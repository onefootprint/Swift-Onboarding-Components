import '../../../../../../../config/initializers/i18next-test';

import { customRender } from '@onefootprint/test-utils';
import { ToastProvider } from '@onefootprint/ui';
import { MachineProvider } from 'src/plugins/collect-kyc-data/components/machine-provider';
import type { InitMachineArgs } from 'src/plugins/collect-kyc-data/utils/state-machine/machine';

import { Layout } from '../../../../../../../components';
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
