import type { TenantScope } from '@onefootprint/request-types/dashboard';

export default function getScopeDiff(oldScopes: TenantScope[], newScopes: TenantScope[]) {
  const commonScopes = oldScopes.filter(oldScope => newScopes.some(newScope => newScope.kind === oldScope.kind));

  const oldScopesRemoved = oldScopes.filter(oldScope => !newScopes.some(newScope => newScope.kind === oldScope.kind));

  const newScopesAdded = newScopes.filter(newScope => !oldScopes.some(oldScope => oldScope.kind === newScope.kind));

  return {
    commonScopes,
    oldScopesRemoved,
    newScopesAdded,
  };
}
