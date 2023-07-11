import {
  NonDecryptRoleScope,
  RoleScope,
  RoleScopeKind,
} from '@onefootprint/types';

import {
  DecryptOption,
  decryptOptionFromScope,
} from '../../../../../form/components/permissions/hooks/use-decrypt-options';

/// Separate scopes into "decrypt" scopes that are displayed in the decrypt dropdown and
/// "non-decrypt" scopes that have their own checkboxes
const groupScopes = (scopes: RoleScope[]) => {
  const decryptOptions: DecryptOption[] = [];
  const nonDecryptScopes: NonDecryptRoleScope[] = [];

  scopes.forEach(scope => {
    const decryptOption = decryptOptionFromScope(scope);
    if (decryptOption) {
      decryptOptions.push(decryptOption);
    } else if (scope.kind !== RoleScopeKind.decrypt) {
      nonDecryptScopes.push(scope);
    }
  });
  const isAdmin = scopes.some(s => s.kind === RoleScopeKind.admin);
  return { isAdmin, decryptOptions, nonDecryptScopes };
};

export default groupScopes;
