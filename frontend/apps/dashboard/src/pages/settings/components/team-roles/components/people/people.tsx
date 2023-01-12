import { Pagination } from '@onefootprint/ui';
import React from 'react';

import PeopleTable from './components/people-table';
import useOrgMembers from './hooks/use-org-members';

const PAGE_SIZE = 10;

const People = () => {
  const {
    members,
    totalNumResults,
    pageIndex,
    isLoading,
    loadNextPage,
    loadPrevPage,
    hasNextPage,
    hasPrevPage,
    setFilter,
  } = useOrgMembers(PAGE_SIZE);

  return (
    <section>
      <PeopleTable
        members={members}
        isLoading={isLoading}
        onFilter={emails => setFilter({ emails })}
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

export default People;
