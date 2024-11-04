import type { UpdateOrgRoleDetail } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import RoleDisplay from '../role-display/role-display';

type UpdateOrgRoleProps = { detail: UpdateOrgRoleDetail };

const UpdateOrgRole = ({ detail }: UpdateOrgRoleProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  const { roleName, newScopes } = detail.data;
  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {t('edited-the')}
      </Text>
      <RoleDisplay name={roleName} scopes={newScopes} />
      <Text variant="body-3" color="tertiary" tag="span">
        {t('role-permissions')}
      </Text>
    </>
  );
};

export default UpdateOrgRole;
