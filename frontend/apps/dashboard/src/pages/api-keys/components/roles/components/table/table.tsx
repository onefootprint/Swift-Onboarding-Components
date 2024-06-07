import { RoleKind } from '@onefootprint/types';
import { Box, Pagination } from '@onefootprint/ui';
import React from 'react';
import useRoles from 'src/components/roles/hooks/use-roles';
import RolesTable from 'src/components/roles/roles-table';

const Table = () => {
  const { data: response, errorMessage, isLoading, pagination } = useRoles(RoleKind.apiKey);

  return (
    <Box testID="roles-table" tag="section">
      <RolesTable data={response?.data} errorMessage={errorMessage} isLoading={isLoading} kind={RoleKind.apiKey} />
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
