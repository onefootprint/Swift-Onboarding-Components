import { useTranslation } from '@onefootprint/hooks';
import { OrgMember } from '@onefootprint/types';
import { Badge, Typography } from '@onefootprint/ui';
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
}: RowProps) => {
  const { t } = useTranslation('pages.settings.members.table');

  return (
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
      <Td>
        {!lastLoginAt && <Badge variant="warning">{t('pending-invite')}</Badge>}
      </Td>
    </>
  );
};

const Td = styled.td`
  && {
    height: 56px;
  }
`;

export default Row;
