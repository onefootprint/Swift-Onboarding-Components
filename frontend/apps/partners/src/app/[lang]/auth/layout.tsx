import React from 'react';

import type { LangProp } from '@/app/types';
import type { Namespaces } from '@/i18n';
import { LangFallback, TranslationsProvider, initTranslations } from '@/i18n';

import AuthLayoutClient from './layout-client';

type AuthLayoutProps = { children: React.ReactNode; params: LangProp };
const i18nNamespaces: Namespaces[] = ['common'];

const AuthLayout = async ({ children, params }: AuthLayoutProps) => {
  const lang = params.lang || LangFallback;
  const { resources } = await initTranslations(lang, i18nNamespaces);

  return (
    <TranslationsProvider locale={lang} namespaces={i18nNamespaces} resources={resources}>
      <AuthLayoutClient>{children}</AuthLayoutClient>
    </TranslationsProvider>
  );
};

export default AuthLayout;
