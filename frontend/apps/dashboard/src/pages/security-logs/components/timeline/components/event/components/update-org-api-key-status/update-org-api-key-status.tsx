import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';
import ApiKeyDisplay from '../api-key-display';

type UpdateOrgApiKeyStatusProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const UpdateOrgApiKeyStatus = ({ detail, hasPrincipalActor }: UpdateOrgApiKeyStatusProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });
  if (detail.kind !== 'update_org_api_key_status') {
    return null;
  }
  const {
    apiKey: {
      name,
      role: { scopes, name: roleName },
    },
    status,
  } = detail.data;

  const statusText = status === 'enabled' ? t('enabled') : t('disabled');
  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? statusText : capitalize(statusText)}
      </Text>
      <ApiKeyDisplay name={name} scopes={scopes} roleName={roleName} />
    </>
  );
};

export default UpdateOrgApiKeyStatus;
