import { useEffect, useState } from 'react';

import useGetOrgMembers from './use-get-org-members';
import useOrgMembersFilters, { getCursors } from './use-org-members-filters';

const useOrgMembers = (pageSize: number) => {
  const getOrgMembers = useGetOrgMembers(pageSize);
  const [totalNumResults, setTotalNumResults] = useState(0);
  const { filters, setFilter, setCursors } = useOrgMembersFilters();

  useEffect(() => {
    // Only update total count of results when it is sent from the server
    if (
      getOrgMembers.data?.meta.count ||
      getOrgMembers.data?.meta.count === 0
    ) {
      setTotalNumResults(getOrgMembers.data?.meta.count);
    }
  }, [getOrgMembers.data]);

  // The backend only supports paginating forward, so we will keep a stack of the previous pages
  // we've visited in order to paginate backwards
  const cursors = getCursors(filters);

  // Add the new cursor onto the stack
  const loadNextPage = () =>
    getOrgMembers.data?.meta.next &&
    setCursors([...cursors, getOrgMembers.data.meta.next]);

  // Pop the last cursor off the stack
  const loadPrevPage = () => setCursors(cursors.slice(0, -1));

  const members = getOrgMembers.data?.data || [];

  return {
    members,
    totalNumResults,
    pageIndex: cursors.length,
    isLoading: getOrgMembers.isLoading,
    loadNextPage,
    loadPrevPage,
    hasNextPage: !!getOrgMembers.data?.meta.next,
    hasPrevPage: cursors.length > 0,
    filters,
    setFilter,
  };
};

export default useOrgMembers;
