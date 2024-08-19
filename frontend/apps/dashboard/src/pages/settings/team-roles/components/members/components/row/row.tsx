import type { Member } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Badge, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';
import useUserSession from 'src/hooks/use-user-session';
import styled from 'styled-components';

import Actions from './components/actions';
import EditRole from './components/edit-role';

export type RowProps = {
  member: Member;
};

const Row = ({ member }: RowProps) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.members.table',
  });
  const session = useUserSession();
  const { hasPermission } = usePermissions();
  const { id, email, firstName, lastName } = member;
  const lastLoginAt = member.rolebinding?.lastLoginAt;
  const isMemberCurrentUser = session.data?.id === id;
  const shouldShowActions = !isMemberCurrentUser;

  return (
    <>
      <Td>
        {firstName ? `${firstName} ${lastName}` : '-'}
        <Text variant="body-3" color="tertiary">
          {email}
        </Text>
      </Td>
      <Td>{lastLoginAt || '-'}</Td>
      <Td>
        {shouldShowActions && hasPermission(RoleScopeKind.orgSettings) ? (
          <EditRole member={member} />
        ) : (
          member.role.name
        )}
      </Td>
      <Td>{!lastLoginAt && <Badge variant="warning">{t('pending-invite')}</Badge>}</Td>
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
