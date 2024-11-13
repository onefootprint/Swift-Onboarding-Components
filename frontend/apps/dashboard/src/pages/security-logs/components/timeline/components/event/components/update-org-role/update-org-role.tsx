import type { AuditEventDetail, TenantScope } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';
import RoleDisplay from '../role-display/role-display';

type UpdateOrgRoleProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const UpdateOrgRole = ({ detail, hasPrincipalActor }: UpdateOrgRoleProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  if (detail.kind !== 'update_org_role') return null;
  const { roleName, newScopes } = detail.data;
  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('edited-the') : capitalize(t('edited-the'))}
      </Text>
      <RoleDisplay name={roleName} scopes={newScopes as TenantScope[]} />
      <Text variant="body-3" color="tertiary" tag="span">
        {t('role-permissions')}
      </Text>
    </>
  );
};

export default UpdateOrgRole;
