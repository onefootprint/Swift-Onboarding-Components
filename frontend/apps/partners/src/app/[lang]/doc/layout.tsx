import type React from 'react';

import type { LangProp } from '@/app/types';
import type { Namespaces } from '@/i18n';
import { LangFallback, TranslationsProvider, initTranslations } from '@/i18n';

import DocRootLayoutClient from './layout-client';

type DocRootLayoutProps = { children: React.ReactNode; params: LangProp };
const i18nNamespaces: Namespaces[] = ['common'];

const DocRootLayout = async ({ children, params }: DocRootLayoutProps) => {
  const lang = params.lang || LangFallback;
  const { resources } = await initTranslations(lang, i18nNamespaces);

  return (
    <TranslationsProvider locale={lang} namespaces={i18nNamespaces} resources={resources}>
      <DocRootLayoutClient>{children}</DocRootLayoutClient>
    </TranslationsProvider>
  );
};

export default DocRootLayout;
