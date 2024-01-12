import { RoleScopeKind } from '@onefootprint/types';

import useSession from '../use-session';

const usePermissions = () => {
  const session = useSession();
  let scopes = session.data.user?.scopes || [];
  if (
    session.data.user?.isAssumedSession &&
    !session.data.user?.isAssumedSessionEditMode
  ) {
    scopes = scopes.filter(s => s.kind === RoleScopeKind.read);
  }
  const isAdmin = scopes.some(s => s.kind === RoleScopeKind.admin);

  const hasPermission = (scopeKind: RoleScopeKind) =>
    isAdmin || scopes.some(s => s.kind === scopeKind);

  return {
    hasPermission,
    scopes,
    isAdmin,
  };
};

export default usePermissions;
