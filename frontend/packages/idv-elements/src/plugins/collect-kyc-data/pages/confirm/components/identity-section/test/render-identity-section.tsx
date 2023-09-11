import { customRender } from '@onefootprint/test-utils';
import { ToastProvider } from '@onefootprint/ui';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Layout } from 'src/components';
import { MachineProvider } from 'src/plugins/collect-kyc-data/components/machine-provider';
import type { MachineContext } from 'src/plugins/collect-kyc-data/utils/state-machine';

import configureI18next from '../../../../../config/initializers/i18next';
import IdentitySection from '../identity-section';

type WrapperProps = {
  children: React.ReactNode;
};

const i18n = configureI18next();

export const WithTranslation = ({ children }: WrapperProps) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export const renderIdentitySection = (initialContext: MachineContext) =>
  customRender(
    <WithTranslation>
      <ToastProvider>
        <Layout>
          <MachineProvider initialContext={initialContext} initState="confirm">
            <IdentitySection />
          </MachineProvider>
        </Layout>
      </ToastProvider>
    </WithTranslation>,
  );

export * from '@onefootprint/test-utils';
