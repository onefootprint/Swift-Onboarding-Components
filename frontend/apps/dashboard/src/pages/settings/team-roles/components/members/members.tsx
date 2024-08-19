import { Box, Pagination, Portal } from '@onefootprint/ui';

import Invite from './components/invite';
import MembersTable from './components/members-table';
import useMembers from './hooks/use-members';

const Members = () => {
  const { data: response, errorMessage, isLoading, pagination } = useMembers();

  return (
    <Box testID="people-table" tag="section">
      <Portal selector="#team-roles-actions">
        <Invite />
      </Portal>
      <MembersTable data={response?.data} errorMessage={errorMessage} isLoading={isLoading} />
      {response && response.meta.count > 0 && (
        <Pagination
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onNextPage={pagination.loadNextPage}
          onPrevPage={pagination.loadPrevPage}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalNumResults={pagination.count}
        />
      )}
    </Box>
  );
};

export default Members;
