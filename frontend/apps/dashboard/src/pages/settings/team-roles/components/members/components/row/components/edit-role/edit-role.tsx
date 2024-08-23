import type { Member } from '@onefootprint/types';
import { RoleKind } from '@onefootprint/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useRoles from 'src/hooks/use-roles';

import RoleDropdownSelector from 'src/components/role-dropdown-selector';
import useUpdateMember from './hooks/use-update-member';

export type EditRoleProps = {
  member: Member;
};

const EditRole = ({ member }: EditRoleProps) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.members.edit-role',
  });
  const [value, setValue] = useState({
    id: member.role.id,
    name: member.role.name,
  });
  const rolesQuery = useRoles(RoleKind.dashboardUser);
  const updateMemberMutation = useUpdateMember(member.id);
  const options = rolesQuery?.data?.map(r => ({
    id: r.id,
    name: r.name,
    customData: r.scopes,
  }));

  const handleChange = (roleId: string) => {
    // We do a optimistic update, if the mutation fails we revert the value
    const newRole = rolesQuery.data?.find(role => role.id === roleId);
    if (newRole) {
      setValue({ id: newRole.id, name: newRole.name });
      updateMemberMutation.mutate(
        { roleId },
        {
          onError: () => {
            setValue({
              id: member.role.id,
              name: member.role.name,
            });
          },
        },
      );
    }
  };

  return (
    <RoleDropdownSelector
      options={options}
      triggerAriaLabel={t('aria-label', { email: member.email })}
      value={value}
      onValueChange={handleChange}
    />
  );
};

export default EditRole;
