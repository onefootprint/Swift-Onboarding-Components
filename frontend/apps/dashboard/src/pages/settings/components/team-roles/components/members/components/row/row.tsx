import { useTranslation } from '@onefootprint/hooks';
import { OrgMember } from '@onefootprint/types';
import { Badge, Typography } from '@onefootprint/ui';
import React from 'react';
import useUserSession from 'src/hooks/use-user-session';
import styled from 'styled-components';

import Actions from './components/actions';
import EditRole from './components/edit-role';

export type RowProps = {
  member: OrgMember;
};

const Row = ({ member }: RowProps) => {
  const { t } = useTranslation('pages.settings.members.table');
  const session = useUserSession();
  const { email, firstName, lastName, lastLoginAt } = member;
  const isMemberCurrentUser = session.data?.id === member.id;
  const shouldShowActions = !isMemberCurrentUser;

  return (
    <>
      <Td>
        {firstName ? `${firstName} ${lastName}` : '-'}
        <Typography variant="body-3" color="tertiary">
          {email}
        </Typography>
      </Td>
      <Td>{lastLoginAt || '-'}</Td>
      <Td>
        {shouldShowActions ? <EditRole member={member} /> : member.roleName}
      </Td>
      <Td>
        {!lastLoginAt && <Badge variant="warning">{t('pending-invite')}</Badge>}
      </Td>
      <Td>{shouldShowActions && <Actions member={member} />}</Td>
    </>
  );
};

const Td = styled.td`
  && {
    height: 56px;
  }
`;

export default Row;
