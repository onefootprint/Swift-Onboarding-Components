import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import useCurrentEntityTimeline from '@/entity/hooks/use-current-entity-timeline';

import Section from '../section';
import Content from './components/content';
import Error from './components/error';

const AuditTrail = () => {
  const { t } = useTranslation('pages.entity.audit-trail');
  const { errorMessage, data } = useCurrentEntityTimeline();

  return (
    <Section title={t('title')}>
      {errorMessage && <Error message={errorMessage} />}
      {data && <Content timeline={data} />}
    </Section>
  );
};

export default AuditTrail;
