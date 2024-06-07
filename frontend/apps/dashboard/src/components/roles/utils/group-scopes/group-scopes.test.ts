import { CollectedKycDataOption, RoleScopeKind } from '@onefootprint/types';

import { DecryptOption } from '../../hooks/use-decrypt-options';
import { VaultProxyOptionKind } from '../../hooks/use-vault-proxy-options';
import groupScopes from './group-scopes';

describe('groupScopes', () => {
  it('should return true when checking with "admin"', () => {
    const result = groupScopes([{ kind: RoleScopeKind.read }, { kind: RoleScopeKind.admin }]);
    expect(result.isAdmin).toBeTruthy();
  });
  it('should separate perms properly', () => {
    const { isAdmin, decryptOptions, basicScopes, vaultProxyOptions } = groupScopes([
      { kind: RoleScopeKind.read },
      { kind: RoleScopeKind.apiKeys },
      { kind: RoleScopeKind.decryptAll },
      { kind: RoleScopeKind.decryptCustom },
      { kind: RoleScopeKind.decryptDocuments },
      { kind: RoleScopeKind.decrypt, data: CollectedKycDataOption.email },
      { kind: RoleScopeKind.decrypt, data: CollectedKycDataOption.ssn9 },
      {
        kind: RoleScopeKind.invokeVaultProxy,
        data: { kind: VaultProxyOptionKind.jit },
      },
      {
        kind: RoleScopeKind.invokeVaultProxy,
        data: { kind: 'id', id: 'proxy_12345' },
      },
    ]);
    expect(isAdmin).toBeFalsy();
    expect(decryptOptions).toEqual([
      DecryptOption.all,
      DecryptOption.custom,
      DecryptOption.documents,
      DecryptOption.email,
      DecryptOption.ssn9,
    ]);
    expect(vaultProxyOptions).toEqual([VaultProxyOptionKind.jit, 'proxy_12345']);
    expect(basicScopes).toEqual([{ kind: RoleScopeKind.read }, { kind: RoleScopeKind.apiKeys }]);
  });
});
