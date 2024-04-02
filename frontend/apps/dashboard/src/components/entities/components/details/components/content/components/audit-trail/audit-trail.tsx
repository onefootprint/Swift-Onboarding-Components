import React from 'react';
import { Error } from 'src/components';
import { useTranslation } from 'react-i18next';

import { AUDIT_TRAILS_ID } from '@/entity/constants';
import useCurrentEntityTimeline from '@/entity/hooks/use-current-entity-timeline';

import Section from '../section';
import AddFreeFormNote from './components/add-free-form-note';
import Content from './components/content';

const AuditTrail = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail',
  });
  const { data, error } = useCurrentEntityTimeline();

  return (
    <Section
      title={t('title')}
      id={AUDIT_TRAILS_ID}
      suffixActions={<AddFreeFormNote />}
    >
      <>
        {error && <Error error={error} />}
        {data && <Content timeline={data} />}
      </>
    </Section>
  );
};

export default AuditTrail;
