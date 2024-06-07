import type { BasicRoleScope, RoleScope } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';

import type { DecryptOption } from '../../hooks/use-decrypt-options';
import { decryptOptionFromScope } from '../../hooks/use-decrypt-options';
import type { VaultProxyOption } from '../../hooks/use-vault-proxy-options';
import { vaultProxyOptionFromScope } from '../../hooks/use-vault-proxy-options';

/// Separate scopes into "decrypt" scopes that are displayed in the decrypt dropdown and
/// "non-decrypt" scopes that have their own checkboxes
const groupScopes = (scopes: RoleScope[]) => {
  const decryptOptions: DecryptOption[] = [];
  const basicScopes: BasicRoleScope[] = [];
  const vaultProxyOptions: VaultProxyOption[] = [];

  scopes.forEach(scope => {
    const decryptOption = decryptOptionFromScope(scope);
    const proxyOption = vaultProxyOptionFromScope(scope);
    if (decryptOption) {
      decryptOptions.push(decryptOption);
    } else if (proxyOption) {
      vaultProxyOptions.push(proxyOption);
    } else if (scope.kind !== RoleScopeKind.decrypt && scope.kind !== RoleScopeKind.invokeVaultProxy) {
      basicScopes.push(scope);
    }
  });
  const isAdmin = scopes.some(s => s.kind === RoleScopeKind.admin);
  return { isAdmin, decryptOptions, basicScopes, vaultProxyOptions };
};

export default groupScopes;
