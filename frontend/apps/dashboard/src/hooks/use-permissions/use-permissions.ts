import { RoleScope, UserDataAttribute } from '@onefootprint/types';

import useSession from '../use-session';

const usePermissions = () => {
  const session = useSession();
  const scopes = session.data?.user.role.scopes || [];
  const isAdmin = scopes.includes(RoleScope.admin);
  const canDecrypt =
    isAdmin || scopes.some(scope => scope.startsWith('decrypt'));

  const hasPermission = (permission: RoleScope) =>
    scopes.includes(permission) || isAdmin;

  // TODO:
  // https://linear.app/footprint/issue/FP-2909/add-new-format-for-attributes-in-onboarding
  // Migrate to user attributes once the backend returns the same shape on the backend
  const hasDecryptionPermissionByAttribute = (
    attributes: UserDataAttribute[],
    hasIdentityDocumentImages: boolean,
  ) => {
    if (isAdmin) {
      return true;
    }
    return attributes.some(attribute => {
      if (
        attribute === UserDataAttribute.firstName ||
        attribute === UserDataAttribute.lastName
      ) {
        return hasPermission(RoleScope.decryptName);
      }
      if (attribute === UserDataAttribute.phoneNumber) {
        return hasPermission(RoleScope.decryptPhoneNumber);
      }
      if (attribute === UserDataAttribute.email) {
        return hasPermission(RoleScope.decryptEmail);
      }
      if (attribute === UserDataAttribute.dob) {
        return hasPermission(RoleScope.decryptDob);
      }
      if (attribute === UserDataAttribute.ssn9) {
        return hasPermission(RoleScope.decryptSsn9);
      }
      if (attribute === UserDataAttribute.ssn4) {
        return hasPermission(RoleScope.decryptSsn4);
      }
      if (
        attribute === UserDataAttribute.addressLine1 ||
        attribute === UserDataAttribute.addressLine2 ||
        attribute === UserDataAttribute.city ||
        attribute === UserDataAttribute.state
      ) {
        return hasPermission(RoleScope.decryptFullAddress);
      }
      if (
        attribute === UserDataAttribute.country ||
        attribute === UserDataAttribute.zip
      ) {
        return (
          hasPermission(RoleScope.decryptPartialAddress) ||
          hasPermission(RoleScope.decryptFullAddress)
        );
      }
      if (hasIdentityDocumentImages) {
        return hasPermission(RoleScope.decryptDocuments);
      }
      return false;
    });
  };

  return {
    hasPermission,
    hasDecryptionPermissionByAttribute,
    scopes,
    isAdmin,
    canDecrypt,
  };
};

export default usePermissions;
