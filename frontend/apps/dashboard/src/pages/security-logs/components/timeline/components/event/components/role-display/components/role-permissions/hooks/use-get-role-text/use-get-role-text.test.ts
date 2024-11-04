import { customRenderHook } from '@onefootprint/test-utils';
import type { RoleScopeKind } from '@onefootprint/types';
import useGetRoleText from './use-get-role-text';
import { adminScopeFixture, decryptScopeFixture, readScopeFixture } from './use-get-role-text.test.config';

describe('useGetRoleText', () => {
  it('returns "Everything" for admin scope', () => {
    const { result } = customRenderHook(() => useGetRoleText());
    const text = result.current(adminScopeFixture);
    expect(text).toBe('Everything');
  });

  it('returns "Read-only" for read scope', () => {
    const { result } = customRenderHook(() => useGetRoleText());
    const text = result.current(readScopeFixture);
    expect(text).toBe('Read-only');
  });

  it('returns "Decrypt data" for decrypt scope', () => {
    const { result } = customRenderHook(() => useGetRoleText());
    const text = result.current(decryptScopeFixture);
    expect(text).toBe('Decrypt data');
  });

  it('returns empty string for unknown scope', () => {
    const { result } = customRenderHook(() => useGetRoleText());
    const text = result.current({ kind: 'unknown' as RoleScopeKind });
    expect(text).toBe('');
  });
});
