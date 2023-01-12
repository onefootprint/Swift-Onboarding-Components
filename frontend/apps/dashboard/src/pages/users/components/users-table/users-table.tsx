import { useTranslation } from '@onefootprint/hooks';
import { Table } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { User } from 'src/pages/users/users.types';

import useUsersFilters from '../../hooks/use-users-filters';
import Filters from './components/filters';
import Row from './components/row';

type UsersTableProps = {
  users?: User[];
  isLoading: boolean;
};

const UsersTable = ({ isLoading, users }: UsersTableProps) => {
  const router = useRouter();
  const filters = useUsersFilters();
  const { t } = useTranslation('pages.users');
  const columns = [
    { text: t('table.header.name'), width: '14%' },
    { text: t('table.header.token'), width: '18%' },
    { text: t('table.header.status'), width: '18%' },
    { text: t('table.header.email'), width: '20%' },
    { text: t('table.header.ssn'), width: '12%' },
    { text: t('table.header.phone-number'), width: '14%' },
    { text: t('table.header.start'), width: '14%' },
  ];

  const handleRowClick = (user: User) => {
    router.push({
      pathname: 'users/detail',
      query: { footprint_user_id: user.id },
    });
  };

  const handleSearchChange = (search: string) => {
    filters.push({ search });
  };

  return router.isReady ? (
    <Table<User>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={t('table.empty-state')}
      getKeyForRow={(user: User) => user.id}
      initialSearch={filters.query.search}
      isLoading={isLoading}
      items={users}
      onChangeSearchText={handleSearchChange}
      onRowClick={handleRowClick}
      renderActions={() => <Filters />}
      renderTr={({ item: user }) => <Row user={user} />}
    />
  ) : null;
};

export default UsersTable;
