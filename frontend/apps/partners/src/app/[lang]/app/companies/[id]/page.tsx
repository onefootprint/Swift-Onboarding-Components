import React from 'react';

import type { LangProp } from '@/app/types';
import { LangFallback, initTranslations } from '@/i18n';
import {
  getPartnerDocTemplates,
  getPartnerMembers,
  getPartnerPartnerships,
  getPartnerPartnershipsDocuments,
} from '@/queries';

import PartnerDocsPageContent from './content';
import {
  EmptyCompany,
  getDocLabelValue,
  getMemberLabelValue,
  getUnusedTemplates,
  percentageCalc,
  sortByLastUpdatedDesc,
} from './helpers';

type PartnerDocsPageProps = {
  params: LangProp & { id: string };
  searchParams: Record<string, unknown>;
};

const SecurityChecks = {
  accessControl: true,
  dataAccess: true,
  dataEndToEndEncryption: true,
  strongAuthentication: true,
};

const PartnerDocsPage = async ({ params }: PartnerDocsPageProps) => {
  const partnerId = params.id;
  const lang = params.lang || LangFallback;
  const { t } = await initTranslations(lang, ['common']);

  const [documents, templates, company, members] = await Promise.all([
    getPartnerPartnershipsDocuments(partnerId).then(list => list.sort(sortByLastUpdatedDesc)),
    getPartnerDocTemplates()
      .then(list => list.map(getDocLabelValue))
      .catch(() => []),
    getPartnerPartnerships()
      .then(list => list.find(c => c.id === partnerId) || EmptyCompany)
      .catch(() => EmptyCompany),
    getPartnerMembers()
      .then(res => res.data.map(getMemberLabelValue).filter(x => x.label))
      .catch(() => []),
  ]);

  return (
    <PartnerDocsPageContent
      documents={documents}
      documentsStatus={{
        accepted: company.numControlsComplete,
        count: company.numControlsTotal,
        percentage: percentageCalc(company),
      }}
      lang={lang}
      members={members}
      partnerId={partnerId}
      partnerName={company?.companyName || t('company')}
      securityChecks={SecurityChecks}
      templatesUnused={getUnusedTemplates(documents, templates.slice(0))}
    />
  );
};

export default PartnerDocsPage;
