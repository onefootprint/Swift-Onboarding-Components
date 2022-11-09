import { OrgMember } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type MemberRowProps = {
  member: OrgMember;
};

const MemberRow = ({ member }: MemberRowProps) => (
  // TODO: https://linear.app/footprint/issue/FP-1747/translate-role-id-in-people-table-to-a-list-of-permissions
  // TODO: https://linear.app/footprint/issue/FP-1748/add-tests-for-people-table-when-roleid-permissions-mapping-is
  <>
    <td>
      <Typography variant="body-3">{member.roleName}</Typography>
    </td>
    <td>
      <Typography variant="body-3">{member.createdAt}</Typography>
    </td>
    <td>
      <Typography variant="body-3">{member.roleId}</Typography>
    </td>
  </>
);
export default MemberRow;
