import { UserStatus } from '@onefootprint/types';
import usePermissions from 'src/hooks/use-permissions';
import useUser from 'src/pages/users/pages/user-details/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

const useCanDecrypt = () => {
  const userId = useUserId();
  const { data } = useUser(userId);
  const { scopes, isAdmin } = usePermissions();

  if (!data) {
    return false;
  }
  if (!data.isPortable) {
    return true;
  }
  // If there's no onboarding, or the status is incomplete, can't decrypt
  if (data.status === UserStatus.incomplete || !data.onboarding) {
    return false;
  }
  if (isAdmin) {
    return true;
  }
  if (
    data.onboarding.canAccessAttributes?.length === 0 ||
    data.onboarding.canAccessPermissions?.length === 0
  ) {
    return false;
  }
  return data.onboarding.canAccessPermissions?.some(scope =>
    scopes.includes(scope),
  );
};

export default useCanDecrypt;
