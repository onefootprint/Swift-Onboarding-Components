import { useTranslation } from '@onefootprint/hooks';
import type { ApiKey } from '@onefootprint/types';
import { RoleKind } from '@onefootprint/types';
import React, { useState } from 'react';
import useRoles from 'src/hooks/use-roles';
import RoleDropdownSelector from 'src/pages/settings/components/role-dropdown-selector';

import useUpdateRoleId from '../../hooks/use-update-role-id';

export type EditRoleProps = {
  apiKey: ApiKey;
};

const EditRole = ({ apiKey }: EditRoleProps) => {
  const { t } = useTranslation('pages.developers.api-keys.table.edit-role');
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
    <RoleDropdownSelector
      options={options}
      triggerAriaLabel={t('aria-label')}
      value={value}
      onValueChange={handleChange}
    />
  );
};

export default EditRole;
