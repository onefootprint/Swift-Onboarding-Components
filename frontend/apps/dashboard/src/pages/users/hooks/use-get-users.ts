import useDecryptUser from './use-decrypt-user';
import { getCursors, useFilters } from './use-filters';
import useGetOnboardings from './use-get-onboardings';
import useJoinUsers from './use-join-users';

// Higher-order hook that combines all util hooks required for fetching users and decrypting data
const useGetUsers = () => {
  const getOnboardings = useGetOnboardings();
  const { decryptedUsers, loadEncryptedAttributes } = useDecryptUser();
  const { query, setFilter, setCursors } = useFilters();

  // The backend only supports paginating forward, so we will keep a stack of the previous pages
  // we've visited in order to paginate backwards
  const cursors = getCursors(query);

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
    isLoading: getOnboardings.isLoading,
    loadNextPage,
    loadPrevPage,
    hasNextPage: !!getOnboardings.data?.next,
    hasPrevPage: cursors.length > 0,
    query,
    setFilter,
    loadEncryptedAttributes,
  };
};

export default useGetUsers;
