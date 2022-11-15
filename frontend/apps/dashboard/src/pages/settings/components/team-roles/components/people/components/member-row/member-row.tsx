import { OrgMember } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type MemberRowProps = {
  member: OrgMember;
};

// TODO: https://linear.app/footprint/issue/FP-1877/add-dropdown-to-member-row-to-change-role-only-if-logged-in-user-is
const MemberRow = ({ member }: MemberRowProps) => (
  <>
    <td>
      <Typography variant="body-3">{member.email}</Typography>
    </td>
    <td>
      <Typography variant="body-3">{member.lastLoginAt ?? '-'}</Typography>
    </td>
    <td>
      <Typography variant="body-3">{member.roleName}</Typography>
    </td>
  </>
);
export default MemberRow;
