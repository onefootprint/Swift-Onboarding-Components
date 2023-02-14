import { RoleScope } from '@onefootprint/types';

import useSession from '../use-session';

const usePermissions = () => {
  const session = useSession();

  const hasPermission = (permission: RoleScope) => {
    const scopes = session.data?.user.role.scopes || [];
    return scopes.includes(permission) || scopes.includes(RoleScope.admin);
  };

  return { hasPermission };
};

export default usePermissions;
