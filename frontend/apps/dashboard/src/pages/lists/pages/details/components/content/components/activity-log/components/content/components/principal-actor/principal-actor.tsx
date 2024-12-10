import type { Actor } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

type PrincipalActorProps = {
  principal: Actor;
};

const PrincipalActor = ({ principal }: PrincipalActorProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'details.activity-log.principal-actor' });

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-h-8">
      <div className="text-label-3 text-primary">
        {principal.kind === 'footprint' && t('footprint')}
        {principal.kind === 'firm_employee' && t('firm-employee')}
        {principal.kind === 'organization' &&
          (principal?.firstName || principal?.lastName
            ? `${principal?.firstName ?? ''} ${principal?.lastName ?? ''}`
            : t('employees'))}
        {principal.kind === 'api_key' && `${t('api-key')}`}
        {principal.kind === 'user' && t('user')}
      </div>
      {principal.kind === 'organization' && <div className="text-body-3 text-tertiary">({principal.email})</div>}
      {principal.kind === 'api_key' && <div className="text-body-3 text-tertiary">({principal.name})</div>}
    </div>
  );
};

export default PrincipalActor;
