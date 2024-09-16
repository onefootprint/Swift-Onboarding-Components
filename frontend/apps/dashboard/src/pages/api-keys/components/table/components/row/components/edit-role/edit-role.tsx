import type { ApiKey } from '@onefootprint/types';
import { RoleKind } from '@onefootprint/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DropdownSelector from 'src/components/dropdown-selector';
import useRoles from 'src/hooks/use-roles';

import useUpdateRoleId from '../../hooks/use-update-role-id';

export type EditRoleProps = {
  apiKey: ApiKey;
};

const EditRole = ({ apiKey }: EditRoleProps) => {
  const { t } = useTranslation('api-keys', {
    keyPrefix: 'table.edit-role',
  });
  const rolesQuery = useRoles(RoleKind.apiKey);
  const updateApiKeyMutation = useUpdateRoleId();
  const [value, setValue] = useState({
    id: apiKey.role.id,
    name: apiKey.role.name,
  });
  const options = rolesQuery?.data?.map(role => ({
    id: role.id,
    name: role.name,
    customData: role.scopes,
  }));
  const handleChange = (roleId: string) => {
    const newRole = rolesQuery.data?.find(role => role.id === roleId);
    if (newRole) {
      updateApiKeyMutation.mutate(
        {
          ...apiKey,
          roleId: newRole.id,
        },
        {
          onError: () => {
            setValue({
              id: apiKey.role.id,
              name: apiKey.role.name,
            });
          },
        },
      );
      setValue({ id: newRole.id, name: newRole.name });
    }
  };

  return (
    <DropdownSelector options={options} triggerAriaLabel={t('aria-label')} value={value} onValueChange={handleChange} />
  );
};

export default EditRole;
