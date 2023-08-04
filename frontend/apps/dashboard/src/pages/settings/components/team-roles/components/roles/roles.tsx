import { RoleKind } from '@onefootprint/types';
import { Box, Pagination, Portal } from '@onefootprint/ui';
import React from 'react';

import Create from './components/create';
import RolesTable from './components/roles-table';
import useRoles from './hooks/use-roles';

const Roles = () => {
  const {
    data: response,
    errorMessage,
    isLoading,
    pagination,
  } = useRoles(RoleKind.dashboardUser);

  return (
    <Box testID="roles-table" as="section">
      <Portal selector="#team-roles-actions">
        <Create />
      </Portal>
      <RolesTable
        data={response?.data}
        errorMessage={errorMessage}
        isLoading={isLoading}
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

export default Roles;
