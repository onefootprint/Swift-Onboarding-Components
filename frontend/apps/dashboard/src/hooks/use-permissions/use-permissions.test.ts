import { customRenderHook } from '@onefootprint/test-utils';
import { RoleScopeKind } from '@onefootprint/types';
import { asUserWithScope } from 'src/config/tests';

import usePermissions from './use-permissions';

describe('usePermissions', () => {
  describe('when it has the "admin" scope', () => {
    it('should return true when checking with "admin"', () => {
      asUserWithScope([RoleScopeKind.admin]);
      const { result } = customRenderHook(() => usePermissions());
      expect(result.current.hasPermission('api_keys')).toBeTruthy();
    });
  });

  describe('when it is an admin', () => {
    it('should return isAdmin', () => {
      asUserWithScope([RoleScopeKind.admin]);
      const { result } = customRenderHook(() => usePermissions());
      expect(result.current.isAdmin).toBeTruthy();
    });
  });

  describe('when it has the "api_keys" scope', () => {
    it('should return true when checking with "api_keys"', () => {
      asUserWithScope([RoleScopeKind.apiKeys]);
      const { result } = customRenderHook(() => usePermissions());
      expect(result.current.hasPermission('api_keys')).toBeTruthy();
    });

    it('should return falsy when checking with "onboarding_configuration"', () => {
      asUserWithScope([RoleScopeKind.apiKeys]);
      const { result } = customRenderHook(() => usePermissions());
      expect(result.current.hasPermission('org_settings')).toBeFalsy();
    });
  });
});
