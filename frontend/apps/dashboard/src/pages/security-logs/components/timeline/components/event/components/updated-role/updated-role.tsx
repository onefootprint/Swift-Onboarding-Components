import { IcoUser16 } from '@onefootprint/icons';
import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import BaseHoverCard from '../base-hover-card';
import RoleDiff from './role-diff';

type UpdatedRoleProps = {
  detail: AuditEventDetail;
};

const UpdatedRole = ({ detail }: UpdatedRoleProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  if (detail.kind !== 'update_org_role') return null;

  return (
    <BaseHoverCard
      textTrigger={`${detail.data.roleName}`}
      titleText={`"${detail.data.roleName}" ${t('role-permissions')}`}
      titleIcon={IcoUser16}
    >
      <RoleDiff detail={detail} />
    </BaseHoverCard>
  );
};

export default UpdatedRole;
