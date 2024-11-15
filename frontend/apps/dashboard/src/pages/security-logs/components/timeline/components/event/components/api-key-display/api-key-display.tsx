import type { TenantScope } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const ApiKeyDisplay = ({ name, scopes }: { name: string; scopes: TenantScope[] }) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.api-keys' });

  return (
    <div>
      <Text variant="label-3" color="primary" tag="span" textDecoration="underline">
        {/* TODO: this is a placeholder */}
        {t('api-key')} ({name}) {JSON.stringify(scopes)}
      </Text>
    </div>
  );
};

export default ApiKeyDisplay;
