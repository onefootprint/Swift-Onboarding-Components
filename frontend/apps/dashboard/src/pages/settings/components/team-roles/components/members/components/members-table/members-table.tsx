import { useTranslation } from '@onefootprint/hooks';
import { OrgMember } from '@onefootprint/types';
import { Table } from '@onefootprint/ui';
import React from 'react';

import useOrgMembersFilters from '../../hooks/use-org-members-filters';
import Row from '../row';

type MembersTableProps = {
  data?: OrgMember[];
  errorMessage?: string;
  isLoading?: boolean;
};

const MembersTable = ({ data, isLoading, errorMessage }: MembersTableProps) => {
  const { t } = useTranslation('pages.settings.members');
  const filters = useOrgMembersFilters();
  const columns = [
    { id: 'email', text: t('table.header.email'), width: '25%' },
    { id: 'lastActive', text: t('table.header.lastActive'), width: '20%' },
    { id: 'role', text: t('table.header.role'), width: '45%' },
    { id: 'status', text: '', width: '10%' },
  ];

  const handleSearchChange = (search: string) => {
    filters.push({ member_search: search });
  };

  return (
    <Table<OrgMember>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('table.empty-state')}
      getKeyForRow={member => member.id}
      isLoading={isLoading}
      items={data}
      onChangeSearchText={handleSearchChange}
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

export default MembersTable;
