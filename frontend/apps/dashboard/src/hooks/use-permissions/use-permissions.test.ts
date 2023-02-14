import { renderHook } from '@onefootprint/test-utils';
import { RoleScope } from '@onefootprint/types';
import { asUserWithScope } from 'src/config/tests';

import usePermissions from './use-permissions';

describe('usePermissions', () => {
  describe('when it has the "admin" scope', () => {
    it('should return true when checking with "admin"', () => {
      asUserWithScope([RoleScope.admin]);
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasPermission(RoleScope.apiKeys)).toBeTruthy();
    });
  });

  describe('when it has the "api_keys" scope', () => {
    it('should return true when checking with "api_keys"', () => {
      asUserWithScope([RoleScope.apiKeys]);
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasPermission(RoleScope.apiKeys)).toBeTruthy();
    });

    it('should return falsy when checking with "onboarding_configuration"', () => {
      asUserWithScope([RoleScope.apiKeys]);
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasPermission(RoleScope.orgSettings)).toBeFalsy();
    });
  });
});
