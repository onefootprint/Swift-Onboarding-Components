'use client';

import { createInstance } from 'i18next';
import type React from 'react';
import { I18nextProvider } from 'react-i18next';

import type { Langs, Namespaces } from './config';
import initTranslations from './init-translations';

type I18nInstance = ReturnType<typeof createInstance>;
type InitProps = Parameters<I18nInstance['init']>[0];

type TranslationsProviderProps = {
  children: React.ReactNode;
  locale: Langs;
  namespaces: Namespaces[];
  resources: InitProps['resources'];
};

const TranslationsProvider = ({ children, locale, namespaces, resources }: TranslationsProviderProps) => {
  const i18n = createInstance();

  initTranslations(locale, namespaces, i18n, resources);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default TranslationsProvider;
