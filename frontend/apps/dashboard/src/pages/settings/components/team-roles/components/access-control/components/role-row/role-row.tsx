import { useTranslation } from '@onefootprint/hooks';
import { OrgRole, OrgRolePermission } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import createTagList from 'src/utils/create-tag-list';

type RoleRowProps = {
  role: OrgRole;
};

const RoleRow = ({ role }: RoleRowProps) => {
  const { allT } = useTranslation();
  const scopes = role.scopes.map((p: OrgRolePermission) =>
    allT(`org-role-permissions.${p.kind}`),
  );

  return (
    <>
      <td>
        <Typography variant="body-3">{role.name}</Typography>
      </td>
      <td>
        <Typography variant="body-3">{role.createdAt}</Typography>
      </td>
      <td>
        <Typography variant="body-3">{createTagList(scopes)}</Typography>
      </td>
    </>
  );
};
export default RoleRow;
