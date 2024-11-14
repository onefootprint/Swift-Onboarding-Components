import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';
import RoleDisplay from '../role-display';

type UpdateOrgMemberProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const UpdateOrgMember = ({ detail, hasPrincipalActor }: UpdateOrgMemberProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.update' });
  if (detail.kind !== 'update_org_member') {
    return null;
  }
  const { firstName, lastName, oldRole, newRole } = detail.data;
  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('updated') : capitalize(t('updated'))}
      </Text>
      <Text variant="label-3" tag="span">
        {firstName && lastName ? `${firstName} ${lastName}'s` : t('a-member-s')}
      </Text>
      <Text variant="body-3" color="tertiary" tag="span">
        {t('role-from')}
      </Text>
      <RoleDisplay name={oldRole.name} scopes={oldRole.scopes} />
      <Text variant="body-3" color="tertiary" tag="span">
        {t('to')}
      </Text>
      <RoleDisplay name={newRole.name} scopes={newRole.scopes} />
    </>
  );
};

export default UpdateOrgMember;
