import { getTenantScope } from '@onefootprint/fixtures/dashboard';
import type { CollectedDataOption } from '@onefootprint/request-types/dashboard';
import getScopeDiff from './get-scope-diff';

describe('getScopeDiff', () => {
  it('should identify common, removed and added scopes', () => {
    const oldScopes = [
      getTenantScope({ kind: 'read' }),
      getTenantScope({ kind: 'write_entities' }),
      getTenantScope({ kind: 'org_settings' }),
    ];

    const newScopes = [
      getTenantScope({ kind: 'read' }),
      getTenantScope({ kind: 'write_entities' }),
      getTenantScope({ kind: 'decrypt_all' }),
    ];

    const result = getScopeDiff(oldScopes, newScopes);

    expect(result.commonScopes).toEqual([getTenantScope({ kind: 'read' }), getTenantScope({ kind: 'write_entities' })]);
    expect(result.oldScopesRemoved).toEqual([getTenantScope({ kind: 'org_settings' })]);
    expect(result.newScopesAdded).toEqual([getTenantScope({ kind: 'decrypt_all' })]);
  });

  it('should handle empty arrays', () => {
    const result = getScopeDiff([], []);
    expect(result).toEqual({
      commonScopes: [],
      oldScopesRemoved: [],
      newScopesAdded: [],
    });
  });

  it('should handle arrays with no common scopes', () => {
    const oldScopes = [getTenantScope({ kind: 'read' })];
    const newScopes = [getTenantScope({ kind: 'write_entities' })];

    const result = getScopeDiff(oldScopes, newScopes);

    expect(result).toEqual({
      commonScopes: [],
      oldScopesRemoved: [getTenantScope({ kind: 'read' })],
      newScopesAdded: [getTenantScope({ kind: 'write_entities' })],
    });
  });

  it('should handle identical arrays', () => {
    const scopes = [getTenantScope({ kind: 'read' }), getTenantScope({ kind: 'write_entities' })];

    const result = getScopeDiff(scopes, scopes);

    expect(result).toEqual({
      commonScopes: scopes,
      oldScopesRemoved: [],
      newScopesAdded: [],
    });
  });

  it('should handle scopes with same kind but different properties as if they are the same (for now)', () => {
    const oldScopes = [getTenantScope({ kind: 'decrypt', data: 'id.first_name' as CollectedDataOption })];
    const newScopes = [getTenantScope({ kind: 'decrypt', data: 'id.last_name' as CollectedDataOption })];

    const result = getScopeDiff(oldScopes, newScopes);

    expect(result).toEqual({
      commonScopes: [getTenantScope({ kind: 'decrypt', data: 'id.first_name' as CollectedDataOption })],
      oldScopesRemoved: [],
      newScopesAdded: [],
    });
  });

  it('should handle duplicate scopes in input arrays', () => {
    const oldScopes = [
      getTenantScope({ kind: 'decrypt', data: 'id.first_name' as CollectedDataOption }),
      getTenantScope({ kind: 'decrypt', data: 'id.last_name' as CollectedDataOption }),
    ];
    const newScopes = [
      getTenantScope({ kind: 'decrypt', data: 'id.first_name' as CollectedDataOption }),
      getTenantScope({ kind: 'decrypt', data: 'id.last_name' as CollectedDataOption }),
    ];

    const result = getScopeDiff(oldScopes, newScopes);

    expect(result).toEqual({
      commonScopes: [
        getTenantScope({ kind: 'decrypt', data: 'id.first_name' as CollectedDataOption }),
        getTenantScope({ kind: 'decrypt', data: 'id.last_name' as CollectedDataOption }),
      ],
      oldScopesRemoved: [],
      newScopesAdded: [],
    });
  });

  it('should handle undefined values in scope properties', () => {
    const oldScopes = [getTenantScope({ kind: 'decrypt', data: undefined })];

    const result = getScopeDiff(oldScopes, []);

    expect(result).toEqual({
      commonScopes: [],
      oldScopesRemoved: [getTenantScope({ kind: 'decrypt', data: undefined })],
      newScopesAdded: [],
    });
  });
});
