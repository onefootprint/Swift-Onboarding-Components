import { RoleScopeKind } from '@onefootprint/types';

import useSession from '../use-session';

const usePermissions = () => {
  const session = useSession();
  const scopes = session.data.user?.scopes || [];
  const isAdmin = scopes.some(s => s.kind === RoleScopeKind.admin);

  const hasPermission = (scopeKind: RoleScopeKind) => isAdmin || scopes.some(s => s.kind === scopeKind);

  return {
    hasPermission,
    scopes,
    isAdmin,
  };
};

export default usePermissions;
