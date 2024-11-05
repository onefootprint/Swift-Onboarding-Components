import type { CreateOrgRoleDetail } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';
import RoleDisplay from '../role-display/role-display';

type CreateOrgRoleProps = { detail: CreateOrgRoleDetail; hasPrincipalActor: boolean };

const CreateOrgRole = ({ detail, hasPrincipalActor }: CreateOrgRoleProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
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
