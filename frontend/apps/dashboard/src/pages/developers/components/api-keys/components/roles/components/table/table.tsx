import { RoleKind } from '@onefootprint/types';
import { Box, Pagination } from '@onefootprint/ui';
import React from 'react';
// TODO move imports
import RolesTable from 'src/pages/settings/components/team-roles/components/roles/components/roles-table';
import useRoles from 'src/pages/settings/components/team-roles/components/roles/hooks/use-roles';

const Table = () => {
  const {
    data: response,
    errorMessage,
    isLoading,
    pagination,
  } = useRoles(RoleKind.apiKey);

  return (
    <Box testID="roles-table" as="section">
      <RolesTable
        data={response?.data}
        errorMessage={errorMessage}
        isLoading={isLoading}
        kind={RoleKind.apiKey}
      />
      {response && response.meta.count > 0 && (
        <Pagination
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onNextPage={pagination.loadNextPage}
          onPrevPage={pagination.loadPrevPage}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalNumResults={response.meta.count}
        />
      )}
    </Box>
  );
};

export default Table;
