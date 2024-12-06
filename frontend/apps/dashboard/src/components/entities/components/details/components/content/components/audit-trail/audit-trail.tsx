import { AUDIT_TRAILS_ID } from '@/entity/constants';
import type { Entity } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';
import Section from '../section';
import AddFreeFormNote from './components/add-free-form-note';
import AuditTrailTimeline from './components/audit-trail-timeline';

export type AuditTrailProps = {
  entity: Entity;
};

const AuditTrail = ({ entity }: AuditTrailProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'audit-trail' });

  return (
    <Section title={t('title')} id={AUDIT_TRAILS_ID} suffixActions={<AddFreeFormNote />}>
      <AuditTrailTimeline entity={entity} />
    </Section>
  );
};

export default AuditTrail;
