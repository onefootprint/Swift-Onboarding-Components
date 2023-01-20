import { useTranslation } from '@onefootprint/hooks';
import { OrgRole } from '@onefootprint/types';
import { Table } from '@onefootprint/ui';
import React from 'react';

import useOrgRolesFilters from '../../hooks/use-org-roles-filters';
import Row from '../row';

type RolesTableProps = {
  data?: OrgRole[];
  errorMessage?: string;
  isLoading?: boolean;
};

const RolesTable = ({ data, errorMessage, isLoading }: RolesTableProps) => {
  const { t } = useTranslation('pages.settings.roles');
  const filters = useOrgRolesFilters();
  const columns = [
    { id: 'role', text: t('table.header.role'), width: '25%' },
    { id: 'created', text: t('table.header.created'), width: '15%' },
    { id: 'permissions', text: t('table.header.permissions'), width: '60%' },
  ];

  const handleSearchChange = (search: string) => {
    filters.push({ roles_search: search });
  };

  return (
    <Table<OrgRole>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('table.empty-state')}
      getKeyForRow={role => role.id}
      isLoading={isLoading}
      items={data}
      onChangeSearchText={handleSearchChange}
      renderTr={({ item: role }) => (
        <Row
          createdAt={role.createdAt}
          id={role.id}
          isImmutable={role.isImmutable}
          name={role.name}
          scopes={role.scopes}
        />
      )}
    />
  );
};

export default RolesTable;
