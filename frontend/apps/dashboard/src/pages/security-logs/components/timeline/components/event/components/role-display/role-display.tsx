import { IcoUser16 } from '@onefootprint/icons';
import type { TenantScope } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import BaseHoverCard from '../base-hover-card';
import RolePermissions from './components/role-permissions';

type RoleDisplayProps = {
  isNew?: boolean;
  name: string;
  scopes: TenantScope[];
};

const RoleDisplay = ({ isNew, name, scopes }: RoleDisplayProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });

  return (
    <BaseHoverCard
      textTrigger={isNew ? `${t('role')} (${name})` : `${name}`}
      titleText={`"${name}" ${t('role-perms-lower')}`}
      titleIcon={IcoUser16}
    >
      <RolePermissions scopes={scopes} name={name} />
    </BaseHoverCard>
  );
};

export default RoleDisplay;
