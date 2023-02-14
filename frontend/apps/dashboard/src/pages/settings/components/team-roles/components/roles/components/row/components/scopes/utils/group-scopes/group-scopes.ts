import { RoleScope } from '@onefootprint/types';

const groupScopes = (scopes: RoleScope[]) => {
  const decryptScopes = scopes.filter((scope: RoleScope) =>
    scope.startsWith('decrypt'),
  );
  const nonDecryptScopes = scopes.filter(
    (scope: RoleScope) => !scope.startsWith('decrypt'),
  );
  const isAdmin = scopes.includes(RoleScope.admin);
  return { isAdmin, decryptScopes, nonDecryptScopes };
};

export default groupScopes;
