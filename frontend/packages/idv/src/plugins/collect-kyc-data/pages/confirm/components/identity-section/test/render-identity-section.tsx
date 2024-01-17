import '../../../../../../../config/initializers/i18next-test';

import { customRender } from '@onefootprint/test-utils';
import { ToastProvider } from '@onefootprint/ui';
import React from 'react';
import { MachineProvider } from 'src/plugins/collect-kyc-data/components/machine-provider';
import type { MachineContext } from 'src/plugins/collect-kyc-data/utils/state-machine';

import { Layout } from '../../../../../../../components';
import IdentitySection from '../identity-section';

export const renderIdentitySection = (initialContext: MachineContext) =>
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
