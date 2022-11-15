import { useEffect, useState } from 'react';

import useGetOrgRoles from './use-get-org-roles';
import useOrgRolesFilters, { getCursors } from './use-org-roles-filters';

const useOrgRoles = (pageSize: number) => {
  const getOrgRoles = useGetOrgRoles(pageSize);
  const [totalNumResults, setTotalNumResults] = useState(0);
  const { filters, setFilter, setCursors } = useOrgRolesFilters();

  useEffect(() => {
    // Only update total count of results when it is sent from the server
    if (getOrgRoles.data?.meta.count || getOrgRoles.data?.meta.count === 0) {
      setTotalNumResults(getOrgRoles.data?.meta.count);
    }
  }, [getOrgRoles.data]);

  // The backend only supports paginating forward, so we will keep a stack of the previous pages
  // we've visited in order to paginate backwards
  const cursors = getCursors(filters);

  // Add the new cursor onto the stack
  const loadNextPage = () =>
    getOrgRoles.data?.meta.next &&
    setCursors([...cursors, getOrgRoles.data.meta.next]);

  // Pop the last cursor off the stack
  const loadPrevPage = () => setCursors(cursors.slice(0, -1));

  const roles = getOrgRoles.data?.data || [];

  return {
    roles,
    totalNumResults,
    pageIndex: cursors.length,
    isLoading: getOrgRoles.isLoading,
    loadNextPage,
    loadPrevPage,
    hasNextPage: !!getOrgRoles.data?.meta.next,
    hasPrevPage: cursors.length > 0,
    filters,
    setFilter,
  };
};

export default useOrgRoles;
