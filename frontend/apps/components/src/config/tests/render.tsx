import '../initializers/react-i18next-test';

import { customRender } from '@onefootprint/test-utils';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import configureReactI18next from '../initializers/react-i18next';

type WrapperProps = {
  children: React.ReactNode;
};

const i18n = configureReactI18next();

export const CustomWrapper = ({ children }: WrapperProps) => <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;

export const renderComponents = (Component?: React.ReactNode) =>
  customRender(<CustomWrapper>{Component}</CustomWrapper>);

export * from '@onefootprint/test-utils';
