import { ToastProvider } from '@onefootprint/ui';
import type { ReactNode } from 'react';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import configureReactI18next from 'src/config/initializers/react-i18next';

import EditProvider from '../../../../edit-machine/machine-provider';

type WrapperProps = {
  children: React.ReactNode;
};

const i18n = configureReactI18next();

const WithTranslation = ({ children }: WrapperProps) => <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;

type TestWrapperProps = {
  children: ReactNode;
};

const TestWrapper = ({ children }: TestWrapperProps) => (
  <WithTranslation>
    <ToastProvider>
      <EditProvider>{children}</EditProvider>
    </ToastProvider>
  </WithTranslation>
);

export default TestWrapper;
