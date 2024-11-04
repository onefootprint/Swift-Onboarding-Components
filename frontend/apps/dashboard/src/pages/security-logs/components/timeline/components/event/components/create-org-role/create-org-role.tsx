import type { CreateOrgRoleDetail } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import RoleDisplay from '../role-display/role-display';

type CreateOrgRoleProps = { detail: CreateOrgRoleDetail };

const CreateOrgRole = ({ detail }: CreateOrgRoleProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  const { roleName, scopes } = detail.data;
  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {t('created-a-new')}
      </Text>
      <RoleDisplay name={roleName} scopes={scopes} isNew={true} />
    </>
  );
};

export default CreateOrgRole;
