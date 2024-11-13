import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';
import RoleDisplay from '../role-display';

type DeactivateOrgRoleProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const DeactivateOrgRole = ({ detail, hasPrincipalActor }: DeactivateOrgRoleProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  if (detail.kind !== 'deactivate_org_role') {
    return null;
  }
  const { roleName, scopes } = detail.data;

  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('deleted-the') : capitalize(t('deleted-the'))}
      </Text>
      <RoleDisplay name={roleName} scopes={scopes} />
      <Text variant="body-3" color="tertiary" tag="span">
        {t('role')}
      </Text>
    </>
  );
};

export default DeactivateOrgRole;
