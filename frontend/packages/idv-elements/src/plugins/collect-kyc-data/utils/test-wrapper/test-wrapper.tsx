import { ToastProvider } from '@onefootprint/ui';
import type { ReactNode } from 'react';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Layout } from 'src/components';
import { MachineProvider } from 'src/plugins/collect-kyc-data/components/machine-provider';
import type { MachineContext } from 'src/plugins/collect-kyc-data/utils/state-machine';

import configureI18next from '../../config/initializers/i18next';

type WrapperProps = {
  children: React.ReactNode;
};

const i18n = configureI18next();

const WithTranslation = ({ children }: WrapperProps) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

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
  <WithTranslation>
    <ToastProvider>
      <Layout>
        <MachineProvider initialContext={initialContext} initState={initState}>
          {children}
        </MachineProvider>
      </Layout>
    </ToastProvider>
  </WithTranslation>
);

export default TestWrapper;
