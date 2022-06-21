import useDecryptUser from './use-decrypt-user';
import { useFilters } from './use-filters';
import useGetOnboardings from './use-get-onboardings';
import useJoinUsers from './use-join-users';

// Higher-order hook that combines all util hooks required for fetching users and decrypting data
const useGetUsers = () => {
  const getOnboardings = useGetOnboardings();
  const { decryptedUsers, loadEncryptedAttributes } = useDecryptUser();
  const { query, setFilter } = useFilters();

  // The backend only supports paginating forward, so we will keep a stack of the previous pages
  // we've visited in order to paginate backwards
  const currentCursors = JSON.parse(query.cursors || '[]');
  const loadNextPage = () => {
    // Add a new cursor to the stack of cursors
    setFilter({
      cursors: JSON.stringify([
        ...currentCursors,
        getOnboardings.data?.next || '',
      ]),
    });
  };
  const loadPrevPage = () => {
    // Pop the last cursor off the stack
    const cursors =
      currentCursors.length > 1
        ? JSON.stringify(currentCursors.slice(0, -1))
        : '';
    setFilter({ cursors });
  };

  // Join the onboarding list results with any decrypted user data
  const users = useJoinUsers(getOnboardings.data?.data || [], decryptedUsers);

  return {
    users,
    isLoading: getOnboardings.isLoading,
    previousCursors: currentCursors,
    loadNextPage,
    loadPrevPage,
    hasNextPage: !!getOnboardings.data?.next,
    hasPrevPage: currentCursors.length > 0,
    query,
    setFilter,
    loadEncryptedAttributes,
  };
};

export default useGetUsers;
