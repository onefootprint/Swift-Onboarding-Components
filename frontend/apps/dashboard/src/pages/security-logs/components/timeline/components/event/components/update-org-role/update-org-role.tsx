import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';

import UpdatedRole from '../updated-role';

type UpdateOrgRoleProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const UpdateOrgRole = ({ detail, hasPrincipalActor }: UpdateOrgRoleProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  if (detail.kind !== 'update_org_role') return null;
  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('edited-the') : capitalize(t('edited-the'))}
      </Text>
      <UpdatedRole detail={detail} />
      <Text variant="body-3" color="tertiary" tag="span">
        {t('role-permissions')}
      </Text>
    </>
  );
};

export default UpdateOrgRole;
