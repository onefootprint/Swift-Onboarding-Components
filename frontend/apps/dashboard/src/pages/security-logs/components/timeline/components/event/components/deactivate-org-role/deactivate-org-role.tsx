import type { DeactivateOrgRoleDetail } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import RoleDisplay from '../role-display';

type DeactivateOrgRoleProps = { detail: DeactivateOrgRoleDetail };

const DeactivateOrgRole = ({ detail }: DeactivateOrgRoleProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  const { roleName, scopes } = detail.data;
  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {t('deleted-the')}
      </Text>
      <RoleDisplay name={roleName} scopes={scopes} />
      <Text variant="body-3" color="tertiary" tag="span">
        {t('role')}
      </Text>
    </>
  );
};

export default DeactivateOrgRole;
