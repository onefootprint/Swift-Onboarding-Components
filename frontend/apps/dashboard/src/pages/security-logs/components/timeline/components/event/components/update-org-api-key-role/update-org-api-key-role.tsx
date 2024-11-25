import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';
import ApiKeyDisplay from '../api-key-display';
import RoleDisplay from '../role-display';

type UpdateOrgApiKeyRoleProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const UpdateOrgApiKeyRole = ({ detail, hasPrincipalActor }: UpdateOrgApiKeyRoleProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.update' });
  if (detail.kind !== 'update_org_api_key_role') {
    return null;
  }
  const { apiKey, oldRole, newRole } = detail.data;
  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('updated') : capitalize(t('updated'))}
      </Text>
      <ApiKeyDisplay name={apiKey.name} scopes={apiKey.role.scopes} roleName={apiKey.role.name} />
      <Text variant="body-3" color="tertiary" tag="span">
        {t('from')}
      </Text>
      <RoleDisplay name={oldRole.name} scopes={oldRole.scopes} />
      <Text variant="body-3" color="tertiary" tag="span">
        {t('to')}
      </Text>
      <RoleDisplay name={newRole.name} scopes={newRole.scopes} />
    </>
  );
};

export default UpdateOrgApiKeyRole;
