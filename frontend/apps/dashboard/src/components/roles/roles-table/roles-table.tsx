import type { Role } from '@onefootprint/types';
import { RoleKind } from '@onefootprint/types';
import { Table } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useRolesFilters from '../hooks/use-roles-filters';
import Row from './components/row';

type RolesTableProps = {
  data?: Role[];
  errorMessage?: string;
  isPending?: boolean;
  kind: RoleKind;
};

const RolesTable = ({ data, errorMessage, isPending, kind }: RolesTableProps) => {
  const { t } = useTranslation('roles');
  const filters = useRolesFilters();
  const columns = [
    { id: 'role', text: t('table.header.role'), width: '19%' },
    kind === RoleKind.dashboardUser
      ? {
          id: 'active-users',
          text: t('table.header.active-users'),
          width: '12%',
        }
      : {
          id: 'active-api-keys',
          text: t('table.header.active-api-keys'),
          width: '12%',
        },
    { id: 'permissions', text: t('table.header.permissions'), width: '37%' },
    { id: 'created', text: t('table.header.created'), width: '15%' },
    { id: 'actions', text: '', width: '5%' },
  ];

  const handleSearchChange = (search: string) => {
    filters.push({ roles_search: search, roles_page: undefined });
  };

  return filters.isReady ? (
    <Table<Role>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('table.empty-state')}
      getKeyForRow={role => role.id}
      initialSearch={filters.values.search}
      isLoading={isPending}
      items={data}
      onChangeSearchText={handleSearchChange}
      renderTr={({ item: role }) => <Row role={role} />}
    />
  ) : null;
};

export default RolesTable;
