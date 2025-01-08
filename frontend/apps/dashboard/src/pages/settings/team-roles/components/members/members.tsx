import { Pagination, Portal } from '@onefootprint/ui';

import Invite from './components/invite';
import MembersTable from './components/members-table';
import useMembers from './hooks/use-members';

const Members = () => {
  const { data: response, errorMessage, isPending, pagination } = useMembers();

  return (
    <section className="flex flex-col" data-testid="people-table">
      <Portal selector="#team-roles-actions">
        <Invite />
      </Portal>
      <MembersTable data={response?.data} errorMessage={errorMessage} isPending={isPending} />
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
    </section>
  );
};

export default Members;
