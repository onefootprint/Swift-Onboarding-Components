import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';
import ApiKeyDisplay from '../api-key-display';

type CreateOrgApiKeyProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const CreateOrgApiKey = ({ detail, hasPrincipalActor }: CreateOrgApiKeyProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.api-keys' });
  if (detail.kind !== 'create_org_api_key') {
    return null;
  }
  const {
    apiKey: {
      name,
      role: { scopes },
    },
  } = detail.data;

  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('created-a-new') : capitalize(t('created-a-new'))}
      </Text>
      <ApiKeyDisplay name={name} scopes={scopes} />
    </>
  );
};

export default CreateOrgApiKey;
