import useDecryptUser from './use-decrypt-user';
import { useFilters } from './use-filters';
import useGetOnboardings from './use-get-onboardings';
import useJoinUsers from './use-join-users';

// Higher-order hook that combines all util hooks required for fetching users and decrypting data
const useGetUsers = () => {
  const getOnboardings = useGetOnboardings();
  const { decryptedUsers, loadEncryptedAttributes } = useDecryptUser();
  const { query, setFilter } = useFilters();

  // Join the onboarding list results with any decrypted user data
  const users = useJoinUsers(getOnboardings.data, decryptedUsers);

  return {
    users,
    isLoading: getOnboardings.isLoading,
    query,
    setFilter,
    loadEncryptedAttributes,
  };
};

export default useGetUsers;
