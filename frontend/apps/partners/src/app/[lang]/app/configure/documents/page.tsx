import React from 'react';

import type { LangProp } from '@/app/types';
import { LangFallback } from '@/i18n';
import { getPartnerDocTemplates } from '@/queries';

import ConfigureDocumentsContent from './content';

type ConfigureDocumentsPageProps = { params: LangProp };

const ConfigureDocumentsPage = async ({ params: { lang = LangFallback } }: ConfigureDocumentsPageProps) => {
  const templates = await getPartnerDocTemplates();
  return <ConfigureDocumentsContent lang={lang} templates={templates} />;
};

export default ConfigureDocumentsPage;
