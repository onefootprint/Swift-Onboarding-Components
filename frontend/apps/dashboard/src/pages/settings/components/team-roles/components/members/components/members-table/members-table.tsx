import type { Member } from '@onefootprint/types';
import { Table } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useMembersFilters from '../../hooks/use-members-filters';
import Row from '../row';
import Filters from './components/filters';

type MembersTableProps = {
  data?: Member[];
  errorMessage?: string;
  isLoading?: boolean;
};

const MembersTable = ({ data, isLoading, errorMessage }: MembersTableProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.members',
  });
  const filters = useMembersFilters();
  const columns = [
    { id: 'email', text: t('table.header.email'), width: '25%' },
    { id: 'lastActive', text: t('table.header.lastActive'), width: '20%' },
    { id: 'role', text: t('table.header.role'), width: '35%' },
    { id: 'status', text: '', width: '10%' },
    { id: 'actions', text: '', width: '5%' },
  ];

  const handleSearchChange = (search: string) => {
    filters.push({ members_search: search });
  };

  return filters.isReady ? (
    <Table<Member>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('table.empty-state')}
      getKeyForRow={member => member.id}
      initialSearch={filters.values.search}
      isLoading={isLoading}
      items={data}
      onChangeSearchText={handleSearchChange}
      renderActions={() => <Filters />}
      renderTr={({ item: member }) => <Row member={member} />}
    />
  ) : null;
};

export default MembersTable;
