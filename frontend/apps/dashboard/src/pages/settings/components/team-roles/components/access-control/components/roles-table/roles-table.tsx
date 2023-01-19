import { useTranslation } from '@onefootprint/hooks';
import { OrgRole } from '@onefootprint/types';
import { Table, TableRow } from '@onefootprint/ui';
import React from 'react';

import RoleRow from '../role-row';

type RolesTableProps = {
  roles: OrgRole[];
  isLoading?: boolean;
  onFilter: (roles: string) => void;
};

const RolesTable = ({ roles, isLoading, onFilter }: RolesTableProps) => {
  const { t } = useTranslation('pages.settings.access-control');
  const columns = [
    { id: 'role', text: t('table.header.role'), width: '25%' },
    { id: 'created', text: t('table.header.created'), width: '15%' },
    { id: 'permissions', text: t('table.header.permissions'), width: '50%' },
  ];

  return (
    <Table<OrgRole>
      onChangeSearchText={onFilter}
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={t('table.empty-state')}
      getKeyForRow={(role: OrgRole) => role.id}
      isLoading={isLoading}
      items={roles as OrgRole[]}
      renderTr={({ item }: TableRow<OrgRole>) => <RoleRow role={item} />}
    />
  );
};

export default RolesTable;
