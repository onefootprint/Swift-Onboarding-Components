import { useTranslation } from '@onefootprint/hooks';
import { OrgMember } from '@onefootprint/types';
import { Table, TableRow } from '@onefootprint/ui';
import React from 'react';

import MemberRow from '../member-row';

type PeopleTableProps = {
  members: OrgMember[];
  isLoading?: boolean;
  onFilter: (roles: string) => void;
  renderActions: () => React.ReactNode;
};

const PeopleTable = ({
  members,
  isLoading,
  onFilter,
  renderActions,
}: PeopleTableProps) => {
  const { t } = useTranslation('pages.settings.team-roles.people');
  const columns = [
    { id: 'role', text: t('table.header.role'), width: '25%' },
    { id: 'created', text: t('table.header.created'), width: '15%' },
    { id: 'permissions', text: t('table.header.permissions'), width: '50%' },
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
      renderActions={renderActions}
      renderTr={({ item }: TableRow<OrgMember>) => <MemberRow member={item} />}
    />
  );
};

export default PeopleTable;
