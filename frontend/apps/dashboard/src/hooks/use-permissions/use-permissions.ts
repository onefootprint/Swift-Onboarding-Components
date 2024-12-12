import type { TenantScope } from '@onefootprint/request-types/dashboard';

import useSession from '../use-session';

const usePermissions = () => {
  const session = useSession();
  const scopes = session.data.user?.scopes || [];
  const isAdmin = scopes.some(s => s.kind === 'admin');

  const hasPermission = (scopeKind: TenantScope['kind']) => isAdmin || scopes.some(s => s.kind === scopeKind);

  return {
    hasPermission,
    scopes,
    isAdmin,
  };
};

export default usePermissions;
