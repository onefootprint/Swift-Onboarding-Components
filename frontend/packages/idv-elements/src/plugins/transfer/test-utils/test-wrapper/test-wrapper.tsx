import { ToastProvider } from '@onefootprint/ui';
import type { ReactNode } from 'react';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import configureI18next from '../../config/initializers/i18next';

type WrapperProps = {
  children: React.ReactNode;
};

const i18n = configureI18next();

const WithTranslation = ({ children }: WrapperProps) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

type TestWrapperProps = {
  children: ReactNode;
};

const TestWrapper = ({ children }: TestWrapperProps) => (
  <WithTranslation>
    <ToastProvider>{children}</ToastProvider>
  </WithTranslation>
);

export default TestWrapper;
