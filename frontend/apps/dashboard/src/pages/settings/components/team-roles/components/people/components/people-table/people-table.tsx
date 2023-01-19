import { useTranslation } from '@onefootprint/hooks';
import { OrgMember } from '@onefootprint/types';
import { Table } from '@onefootprint/ui';
import React from 'react';

import Row from '../row';

type PeopleTableProps = {
  members: OrgMember[];
  isLoading?: boolean;
  onFilter: (roles: string) => void;
};

const PeopleTable = ({ members, isLoading, onFilter }: PeopleTableProps) => {
  const { t } = useTranslation('pages.settings.team-roles.people');
  const columns = [
    { id: 'email', text: t('table.header.email'), width: '35%' },
    { id: 'lastActive', text: t('table.header.lastActive'), width: '25%' },
    { id: 'role', text: t('table.header.role'), width: '40%' },
  ];

  return (
    <Table<OrgMember>
      onChangeSearchText={onFilter}
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={t('table.empty-state')}
      getKeyForRow={member => member.id}
      isLoading={isLoading}
      items={members}
      renderTr={({ item: member }) => (
        <Row
          createdAt={member.createdAt}
          email={member.email}
          firstName={member.firstName}
          id={member.id}
          lastLoginAt={member.lastLoginAt}
          lastName={member.lastName}
          roleId={member.roleId}
          roleName={member.roleName}
        />
      )}
    />
  );
};

export default PeopleTable;
