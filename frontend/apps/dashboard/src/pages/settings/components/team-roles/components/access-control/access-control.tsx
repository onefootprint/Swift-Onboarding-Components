import { Pagination } from '@onefootprint/ui';
import React from 'react';

import RolesTable from './components/roles-table';
import useOrgRoles from './hooks/use-org-roles';

const PAGE_SIZE = 10;

const AccessControl = () => {
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

  return (
    <section>
      <RolesTable
        roles={roles}
        isLoading={isLoading}
        onFilter={role => setFilter({ roles: role })}
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
