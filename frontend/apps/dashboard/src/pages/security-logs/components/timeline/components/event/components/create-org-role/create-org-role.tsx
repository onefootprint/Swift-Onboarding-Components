import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';
import RoleDisplay from '../role-display/role-display';

type CreateOrgRoleProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const CreateOrgRole = ({ detail, hasPrincipalActor }: CreateOrgRoleProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  if (detail.kind !== 'create_org_role') {
    return null;
  }
  const { roleName, scopes } = detail.data;
  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('created-a-new') : capitalize(t('created-a-new'))}
      </Text>
      <RoleDisplay name={roleName} scopes={scopes} isNew={true} />
    </>
  );
};

export default CreateOrgRole;
