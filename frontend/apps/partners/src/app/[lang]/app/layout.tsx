import type React from 'react';

import type { LangProp } from '@/app/types';
import type { Namespaces } from '@/i18n';
import { LangFallback, TranslationsProvider, initTranslations } from '@/i18n';

import AppLayoutClient from './layout-client';

type AppLayoutProps = { children: React.ReactNode; params: LangProp };
const i18nNamespaces: Namespaces[] = ['common'];

const AppLayout = async ({ children, params }: AppLayoutProps) => {
  const lang = params.lang || LangFallback;
  const { resources } = await initTranslations(lang, i18nNamespaces);

  return (
    <TranslationsProvider locale={lang} namespaces={i18nNamespaces} resources={resources}>
      <AppLayoutClient>{children}</AppLayoutClient>
    </TranslationsProvider>
  );
};

export default AppLayout;
