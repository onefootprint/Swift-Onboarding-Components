import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';
import ApiKeyDisplay from '../api-key-display';

type DecryptOrgApiKeyProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const DecryptOrgApiKey = ({ detail, hasPrincipalActor }: DecryptOrgApiKeyProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });
  if (detail.kind !== 'decrypt_org_api_key') {
    return null;
  }
  const {
    apiKey: {
      name,
      role: { scopes, name: roleName },
    },
  } = detail.data;

  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('decrypted') : capitalize(t('decrypted'))}
      </Text>
      <ApiKeyDisplay name={name} scopes={scopes} roleName={roleName} />
    </>
  );
};

export default DecryptOrgApiKey;
