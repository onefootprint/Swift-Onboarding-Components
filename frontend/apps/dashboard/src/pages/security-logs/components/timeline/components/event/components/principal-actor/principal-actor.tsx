import { IcoSparkles16 } from '@onefootprint/icons';
import type { Actor, AuditEvent } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import BaseHoverCard from '../base-hover-card';
import InsightEventDisplay from './components/insight-event-display';

type PrincipalActorProps = {
  principal: Actor;
  insightEvent: AuditEvent['insightEvent'];
};

const PrincipalActor = ({ principal, insightEvent }: PrincipalActorProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'principal-actor' });

  const getTextTrigger = (principal: Actor) => {
    if (principal.kind === 'footprint') return t('footprint');
    if (principal.kind === 'firm_employee') return t('firm-employee');
    if (principal.kind === 'organization') {
      const name =
        principal.firstName || principal.lastName
          ? `${principal.firstName ?? ''} ${principal.lastName ?? ''}`
          : t('employees');
      return `${name} (${principal.email})`;
    }
    if (principal.kind === 'api_key') return `${t('api-key')} (${principal.name})`;
    if (principal.kind === 'user') return t('a-user');
    return '';
  };

  return (
    <>
      {insightEvent ? (
        <BaseHoverCard
          textTrigger={getTextTrigger(principal)}
          titleText={t('insight-event.title')}
          titleIcon={IcoSparkles16}
        >
          <InsightEventDisplay insightEvent={insightEvent} />
        </BaseHoverCard>
      ) : (
        <>
          <p className="underline text-label-3">{getTextTrigger(principal)}</p>
        </>
      )}
    </>
  );
};

export default PrincipalActor;
