import { useEffect, useState } from 'react';

import useDecryptUser from './use-decrypt-user';
import { getCursors, useFilters } from './use-filters';
import useGetScopedUsers from './use-get-scoped-users';
import useJoinUsers from './use-join-users';

// Higher-order hook that combines all util hooks required for fetching users and decrypting data
const useGetUsers = (pageSize: number) => {
  const getScopedUsers = useGetScopedUsers(pageSize);
  const [totalNumResults, setTotalNumResults] = useState(0);
  const { decryptedUsers, decryptUser } = useDecryptUser();
  const { filters, setFilter, setCursors } = useFilters();

  useEffect(() => {
    // Only update total count of results when it is sent from the server
    if (
      getScopedUsers.data?.meta.count ||
      getScopedUsers.data?.meta.count === 0
    ) {
      setTotalNumResults(getScopedUsers.data?.meta.count);
    }
  }, [getScopedUsers.data]);

  // The backend only supports paginating forward, so we will keep a stack of the previous pages
  // we've visited in order to paginate backwards
  const cursors = getCursors(filters);

  // Add the new cursor onto the stack
  const loadNextPage = () =>
    getScopedUsers.data?.meta.next &&
    setCursors([...cursors, getScopedUsers.data.meta.next]);

  // Pop the last cursor off the stack
  const loadPrevPage = () => setCursors(cursors.slice(0, -1));

  // Join the scoped users list results with any decrypted user data
  const users = useJoinUsers(getScopedUsers.data?.data || [], decryptedUsers);

  return {
    users,
    totalNumResults,
    pageIndex: cursors.length,
    isLoading: getScopedUsers.isLoading,
    loadNextPage,
    loadPrevPage,
    hasNextPage: !!getScopedUsers.data?.meta.next,
    hasPrevPage: cursors.length > 0,
    filters,
    setFilter,
    decryptUser,
  };
};

export default useGetUsers;
