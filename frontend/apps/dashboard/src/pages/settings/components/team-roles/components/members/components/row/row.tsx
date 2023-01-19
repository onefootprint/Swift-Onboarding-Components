import { OrgMember } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

export type RowProps = OrgMember;

// TODO: https://linear.app/footprint/issue/FP-1877/add-dropdown-to-member-row-to-change-role-only-if-logged-in-user-is
const Row = ({
  firstName,
  lastName,
  email,
  lastLoginAt,
  roleName,
}: RowProps) => (
  <>
    <Td>
      {firstName ? (
        <Typography variant="body-3">
          {firstName} {lastName}
        </Typography>
      ) : (
        <Typography variant="body-3">-</Typography>
      )}
      <Typography variant="body-3" color="tertiary">
        {email}
      </Typography>
    </Td>
    <Td>
      <Typography variant="body-3">{lastLoginAt ?? '-'}</Typography>
    </Td>
    <Td>
      <Typography variant="body-3">{roleName}</Typography>
    </Td>
  </>
);

const Td = styled.td`
  && {
    height: 56px;
  }
`;

export default Row;
