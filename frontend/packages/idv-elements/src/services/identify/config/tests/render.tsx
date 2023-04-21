import { customRender } from '@onefootprint/test-utils';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import configureI18next from '../initializers/react-i18next';

type WrapperProps = {
  children: React.ReactNode;
};

const i18n = configureI18next();

export const CustomWrapper = ({ children }: WrapperProps) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export const renderIdentify = (Component?: React.ReactNode) =>
  customRender(<CustomWrapper>{Component}</CustomWrapper>);

export * from '@onefootprint/test-utils';
