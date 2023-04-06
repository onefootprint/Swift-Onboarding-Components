import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import useCurrentEntityTimeline from '@/business/hooks/use-current-entity-timeline';

import SectionHeader from '../section-header';
import Content from './components/content';
import Error from './components/error';

const AuditTrail = () => {
  const { t } = useTranslation('pages.business.audit-trail');
  const { errorMessage, data } = useCurrentEntityTimeline();

  return (
    <section>
      <SectionHeader title={t('title')} />
      {errorMessage && <Error message={errorMessage} />}
      {data && <Content timeline={data} />}
    </section>
  );
};

export default AuditTrail;
