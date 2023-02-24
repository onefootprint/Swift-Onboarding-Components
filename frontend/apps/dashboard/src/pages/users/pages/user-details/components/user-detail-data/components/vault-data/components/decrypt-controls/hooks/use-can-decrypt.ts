import { UserStatus } from '@onefootprint/types';
import usePermissions from 'src/hooks/use-permissions';
import useUser from 'src/pages/users/pages/user-details/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

const useCanDecrypt = () => {
  const userId = useUserId();
  const userQuery = useUser(userId);
  const { hasDecryptionPermissionByAttribute } = usePermissions();

  if (
    !userQuery.data?.onboarding ||
    userQuery.data?.status === UserStatus.incomplete
  ) {
    return false;
  }
  const { canAccessDataAttributes, canAccessIdentityDocumentImages } =
    userQuery.data.onboarding;

  if (!canAccessDataAttributes.length && !canAccessIdentityDocumentImages) {
    return false;
  }

  return hasDecryptionPermissionByAttribute(
    userQuery.data.onboarding.canAccessDataAttributes,
    userQuery.data.onboarding.canAccessIdentityDocumentImages,
  );
};

export default useCanDecrypt;
