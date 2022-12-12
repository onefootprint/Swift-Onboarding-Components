import { useTranslation } from '@onefootprint/hooks';
import { Button, Table, TableRow } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';

import useUserFilters from '../../hooks/use-users-filters';
import { User } from '../../types/user.types';
import Filters from '../filters';
import UsersTableRow from './components/users-table-row';

type UsersTableProps = {
  users?: User[];
  isLoading: boolean;
};

const UsersTable = ({ isLoading, users }: UsersTableProps) => {
  const router = useRouter();
  const { setFilter, filters } = useUserFilters();
  const { t, allT } = useTranslation('pages.users');
  const columns = [
    { text: t('table.header.name'), width: '14%' },
    { text: t('table.header.token'), width: '18%' },
    { text: t('table.header.status'), width: '18%' },
    { text: t('table.header.email'), width: '20%' },
    { text: t('table.header.ssn'), width: '12%' },
    { text: t('table.header.phone-number'), width: '14%' },
    { text: t('table.header.start'), width: '14%' },
  ];

  return (
    <Table<User>
      initialSearch={filters.fingerprint}
      onChangeSearchText={fingerprint => {
        setFilter({ fingerprint });
      }}
      renderActions={() => (
        <Filters
          renderCta={({ onClick, filtersCount }) => (
            <Button size="small" variant="secondary" onClick={onClick}>
              {allT('filters.cta', { count: filtersCount })}
            </Button>
          )}
        />
      )}
      aria-label={t('table.aria-label')}
      emptyStateText={t('table.empty-state')}
      items={users}
      isLoading={isLoading}
      getKeyForRow={(user: User) => user.id}
      onRowClick={(user: User) => {
        router.push({
          pathname: 'users/detail',
          query: { footprint_user_id: user.id },
        });
      }}
      columns={columns}
      renderTr={({ item: user }: TableRow<User>) => (
        <UsersTableRow user={user} />
      )}
    />
  );
};

export default UsersTable;
