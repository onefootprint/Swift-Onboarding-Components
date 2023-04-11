import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import { Error } from 'src/components';

import { AUDIT_TRAILS_ID } from '@/entity/constants';
import useCurrentEntityTimeline from '@/entity/hooks/use-current-entity-timeline';

import Section from '../section';
import Content from './components/content';

const AuditTrail = () => {
  const { t } = useTranslation('pages.entity.audit-trail');
  const { data, error } = useCurrentEntityTimeline();

  return (
    <Section title={t('title')} id={AUDIT_TRAILS_ID}>
      <>
        {error && <Error error={error} />}
        {data && <Content timeline={data} />}
      </>
    </Section>
  );
};

export default AuditTrail;
