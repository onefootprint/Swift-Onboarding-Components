import { useEffect, useState } from 'react';

import useDecryptUser from './use-decrypt-user';
import { getCursors, useFilters } from './use-filters';
import useGetOnboardings from './use-get-onboardings';
import useJoinUsers from './use-join-users';

// Higher-order hook that combines all util hooks required for fetching users and decrypting data
const useGetUsers = (pageSize: number) => {
  const getOnboardings = useGetOnboardings(pageSize);
  const [totalNumResults, setTotalNumResults] = useState(0);
  const { decryptedUsers, loadEncryptedAttributes } = useDecryptUser();
  const { filters, setFilter, setCursors } = useFilters();

  useEffect(() => {
    // Only update total count of results when it is sent from the server
    if (getOnboardings.data?.count || getOnboardings.data?.count === 0) {
      setTotalNumResults(getOnboardings.data?.count);
    }
  }, [getOnboardings.data]);

  // The backend only supports paginating forward, so we will keep a stack of the previous pages
  // we've visited in order to paginate backwards
  const cursors = getCursors(filters);

  // Add the new cursor onto the stack
  const loadNextPage = () =>
    getOnboardings.data?.next &&
    setCursors([...cursors, getOnboardings.data.next]);

  // Pop the last cursor off the stack
  const loadPrevPage = () => setCursors(cursors.slice(0, -1));

  // Join the onboarding list results with any decrypted user data
  const users = useJoinUsers(getOnboardings.data?.data || [], decryptedUsers);

  return {
    users,
    totalNumResults,
    pageIndex: cursors.length,
    isLoading: getOnboardings.isLoading,
    loadNextPage,
    loadPrevPage,
    hasNextPage: !!getOnboardings.data?.next,
    hasPrevPage: cursors.length > 0,
    filters,
    setFilter,
    loadEncryptedAttributes,
  };
};

export default useGetUsers;
