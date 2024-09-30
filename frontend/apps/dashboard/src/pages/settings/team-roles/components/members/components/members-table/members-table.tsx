import type { Member } from '@onefootprint/types';
import { Table } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useMembersFilters from '../../hooks/use-members-filters';
import Row from '../row';
import Filters from './components/filters';

type MembersTableProps = {
  data?: Member[];
  errorMessage?: string;
  isPending?: boolean;
};

const MembersTable = ({ data, isPending, errorMessage }: MembersTableProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.members' });
  const filters = useMembersFilters();
  const columns = [
    { id: 'email', text: t('table.header.email'), width: '25%' },
    { id: 'lastActive', text: t('table.header.lastActive'), width: '20%' },
    { id: 'role', text: t('table.header.role'), width: '35%' },
    { id: 'status', text: '', width: '10%' },
    { id: 'actions', text: '', width: '5%' },
  ];

  const handleSearchChange = (search: string) => {
    filters.push({ members_search: search, members_page: undefined });
  };

  return filters.isReady ? (
    <Table<Member>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('table.empty-state')}
      getKeyForRow={member => member.id}
      initialSearch={filters.values.search}
      isLoading={isPending}
      items={data}
      onChangeSearchText={handleSearchChange}
      renderSubActions={() => <Filters />}
      renderTr={({ item: member }) => <Row member={member} />}
    />
  ) : null;
};

export default MembersTable;
