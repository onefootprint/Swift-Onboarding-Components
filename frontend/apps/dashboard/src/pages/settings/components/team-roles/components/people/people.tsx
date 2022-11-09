import { useTranslation } from '@onefootprint/hooks';
import { Button, Pagination } from '@onefootprint/ui';
import React from 'react';

import MemberFilters from './components/member-filters';
import PeopleTable from './components/people-table';
import useOrgMembers from './hooks/use-org-members';

const PAGE_SIZE = 10;

const People = () => {
  const { allT } = useTranslation('pages.settings.team-roles.people');

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

  const renderTableActions = () => (
    <MemberFilters
      renderCta={({ onClick, filtersCount }) => (
        <Button size="small" variant="secondary" onClick={onClick}>
          {allT('filters.cta', { count: filtersCount })}
        </Button>
      )}
    />
  );

  return (
    <section>
      <PeopleTable
        members={members}
        isLoading={isLoading}
        onFilter={roles => setFilter({ roles })}
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

export default People;
