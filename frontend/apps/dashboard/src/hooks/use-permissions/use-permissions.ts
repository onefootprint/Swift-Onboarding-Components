import { RoleScope } from '@onefootprint/types';

import useSession from '../use-session';

const usePermissions = () => {
  const session = useSession();
  const scopes = session.data?.user.role.scopes || [];
  const isAdmin = scopes.includes(RoleScope.admin);
  const canDecrypt =
    isAdmin || scopes.some(scope => scope.startsWith('decrypt'));

  const hasPermission = (permission: RoleScope) =>
    scopes.includes(permission) || isAdmin;

  return {
    hasPermission,
    scopes,
    isAdmin,
    canDecrypt,
  };
};

export default usePermissions;
