import { OrgRoleScope } from '@onefootprint/types';

const groupScopes = (scopes: OrgRoleScope[]) => {
  const decryptScopes = scopes.filter((scope: OrgRoleScope) =>
    scope.startsWith('decrypt'),
  );
  const nonDecryptScopes = scopes.filter(
    (scope: OrgRoleScope) => !scope.startsWith('decrypt'),
  );
  const isAdmin = scopes.includes('admin');
  return { isAdmin, decryptScopes, nonDecryptScopes };
};

export default groupScopes;
