import { useTranslation } from '@onefootprint/hooks';
import { Button, Pagination } from '@onefootprint/ui';
import React from 'react';

import RoleFilters from './components/role-filters';
import RolesTable from './components/roles-table';
import useOrgRoles from './hooks/use-org-roles';

const PAGE_SIZE = 10;

const AccessControl = () => {
  const { allT } = useTranslation('pages.settings.team-roles.access-control');

  const {
    roles,
    totalNumResults,
    pageIndex,
    isLoading,
    loadNextPage,
    loadPrevPage,
    hasNextPage,
    hasPrevPage,
    setFilter,
  } = useOrgRoles(PAGE_SIZE);

  const renderTableActions = () => (
    <RoleFilters
      renderCta={({ onClick, filtersCount }) => (
        <Button size="small" variant="secondary" onClick={onClick}>
          {allT('filters.cta', { count: filtersCount })}
        </Button>
      )}
    />
  );

  return (
    <section>
      <RolesTable
        roles={roles}
        isLoading={isLoading}
        onFilter={role => setFilter({ roles: role })}
        renderActions={renderTableActions}
      />
      {totalNumResults > 0 && (
        <Pagination
          totalNumResults={totalNumResults}
          pageSize={PAGE_SIZE}
          pageIndex={pageIndex}
          onNextPage={loadNextPage}
          onPrevPage={loadPrevPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      )}
    </section>
  );
};

export default AccessControl;
