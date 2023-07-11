import { CollectedKycDataOption, RoleScopeKind } from '@onefootprint/types';

import { DecryptOption } from '../../../../../form/components/permissions/hooks/use-decrypt-options';
import groupScopes from './group-scopes';

describe('groupScopes', () => {
  it('should return true when checking with "admin"', () => {
    const result = groupScopes([
      { kind: RoleScopeKind.read },
      { kind: RoleScopeKind.admin },
    ]);
    expect(result.isAdmin).toBeTruthy();
  });
  it('should separate decrypt and non-decrypt perms properly', () => {
    const { isAdmin, decryptOptions, nonDecryptScopes } = groupScopes([
      { kind: RoleScopeKind.read },
      { kind: RoleScopeKind.apiKeys },
      { kind: RoleScopeKind.decryptAll },
      { kind: RoleScopeKind.decryptCustom },
      { kind: RoleScopeKind.decryptDocuments },
      { kind: RoleScopeKind.decrypt, data: CollectedKycDataOption.email },
      { kind: RoleScopeKind.decrypt, data: CollectedKycDataOption.ssn9 },
    ]);
    expect(isAdmin).toBeFalsy();
    expect(decryptOptions).toEqual([
      DecryptOption.all,
      DecryptOption.custom,
      DecryptOption.documents,
      DecryptOption.email,
      DecryptOption.ssn9,
    ]);
    expect(nonDecryptScopes).toEqual([
      { kind: RoleScopeKind.read },
      { kind: RoleScopeKind.apiKeys },
    ]);
  });
});
