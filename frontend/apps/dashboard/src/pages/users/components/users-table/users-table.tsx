import { useTranslation } from '@onefootprint/hooks';
import { Button, Table, TableRow } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { User } from 'src/hooks/use-user';

import useUserFilters from '../../hooks/use-users-filters';
import Filters from '../filters';
import UsersTableRow from './components/users-table-row';

type UsersTableProps = {
  users?: User[];
  isLoading: boolean;
};

type UserWithMetadata = Omit<User, 'metadata'> &
  Required<Pick<User, 'metadata'>>;

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
  const usersWithMetadata = (users?.filter((user: User) => !!user.metadata) ??
    []) as UserWithMetadata[];

  return (
    <Table<UserWithMetadata>
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
      items={usersWithMetadata}
      isLoading={isLoading}
      getKeyForRow={(item: UserWithMetadata) => item.metadata.id}
      onRowClick={(item: UserWithMetadata) => {
        router.push({
          pathname: 'users/detail',
          query: { footprint_user_id: item.metadata.id },
        });
      }}
      columns={columns}
      renderTr={({ item }: TableRow<UserWithMetadata>) => (
        <UsersTableRow user={item} />
      )}
    />
  );
};

export default UsersTable;
