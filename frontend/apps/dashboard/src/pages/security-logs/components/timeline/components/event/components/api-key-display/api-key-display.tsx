import { IcoKey16 } from '@onefootprint/icons';
import type { TenantScope } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import BaseHoverCard from '../base-hover-card';
import ApiKeyDetails from './components/api-key-details';

const ApiKeyDisplay = ({ name, scopes, roleName }: { name: string; scopes: TenantScope[]; roleName: string }) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.api-keys' });

  return (
    <BaseHoverCard
      textTrigger={`${t('api-key')} (${name})`}
      titleText={`${name} ${t('api-key-details')}`}
      titleIcon={IcoKey16}
    >
      <ApiKeyDetails name={name} scopes={scopes} roleName={roleName} />
    </BaseHoverCard>
  );
};

export default ApiKeyDisplay;
