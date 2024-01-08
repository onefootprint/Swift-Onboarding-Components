import { customRender } from '@onefootprint/test-utils';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import configureI18next from '../initializers/i18next';

type WrapperProps = {
  children: React.ReactNode;
};

const i18n = configureI18next();

export const WithTranslation = ({ children }: WrapperProps) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export const renderComponent = (Component?: React.ReactNode) =>
  customRender(<WithTranslation>{Component}</WithTranslation>);

export * from '@onefootprint/test-utils';
