import { useTranslation } from '@onefootprint/hooks';
import { OrgMember } from '@onefootprint/types';
import { Table, TableRow } from '@onefootprint/ui';
import React from 'react';

import MemberRow from '../member-row';

type PeopleTableProps = {
  members: OrgMember[];
  isLoading?: boolean;
  onFilter: (roles: string) => void;
};

const PeopleTable = ({ members, isLoading, onFilter }: PeopleTableProps) => {
  const { t } = useTranslation('pages.settings.team-roles.people');
  const columns = [
    { id: 'email', text: t('table.header.email'), width: '25%' },
    { id: 'lastActive', text: t('table.header.lastActive'), width: '15%' },
    { id: 'role', text: t('table.header.role'), width: '50%' },
  ];

  return (
    <Table<OrgMember>
      onChangeSearchText={onFilter}
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={t('table.empty-state')}
      getKeyForRow={(member: OrgMember) => member.id}
      isLoading={isLoading}
      items={members as OrgMember[]}
      renderTr={({ item }: TableRow<OrgMember>) => <MemberRow member={item} />}
    />
  );
};

export default PeopleTable;
