import { act, renderHook } from '@onefootprint/test-utils';
import { RoleScope } from '@onefootprint/types';
import { resetUser } from 'src/config/tests';

import useSession from './use-session';

const loginPayload = {
  auth: '1',
  user: {
    id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
    email: 'jane.doe@acme.com',
    firstName: 'Jane',
    lastName: 'Doe',
    scopes: [RoleScope.admin],
    role: {
      createdAt: '2022-09-19T16:24:34.368337Z',
      id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Admin',
      numActiveUsers: 1,
      scopes: [RoleScope.admin],
    },
    rolebinding: {
      lastLoginAt: '2023-01-18T17:54:10.668420Z',
    },
  },
  org: {
    id: 'org_0912ufkdsmk1l2oedASDF',
    name: 'Acme',
    logoUrl: null,
    isSandboxRestricted: false,
    websiteUrl: null,
    companySize: null,
  },
  meta: {
    createdNewTenant: false,
    isFirstLogin: false,
    requiresOnboarding: false,
    isAssumed: false,
    isLive: true,
  },
};

describe('useSession', () => {
  beforeEach(() => {
    resetUser();
  });

  describe('when the state is empty', () => {
    it('should indicate that the user is not logged in', () => {
      const { result } = renderHook(() => useSession());
      expect(result.current.isLoggedIn).toBeFalsy();
    });
  });

  describe('when logging in', () => {
    it('should indicate the user is logged in and return the session data', () => {
      const { result } = renderHook(() => useSession());
      act(() => {
        result.current.logIn(loginPayload);
      });
      expect(result.current.data).toBeDefined();
      expect(result.current.isLoggedIn).toBeTruthy();
    });
  });

  describe('when completing the onboarding', () => {
    it('should indicate the user has completed the onboarding', () => {
      const { result } = renderHook(() => useSession());
      act(() => {
        result.current.logIn(loginPayload);
      });
      act(() => {
        result.current.completeOnboarding();
      });
      expect(result.current.data?.meta.requiresOnboarding).toBeFalsy();
    });
  });

  describe('when logging out', () => {
    it('should indicate the user is logged out and return an undefined session data', () => {
      const { result } = renderHook(() => useSession());
      act(() => {
        result.current.logIn(loginPayload);
      });
      act(() => {
        result.current.logOut();
      });
      expect(result.current.data.user).toBeUndefined();
      expect(result.current.isLoggedIn).toBeFalsy();
    });
  });

  describe('when updating the org', () => {
    it('should update correctly', () => {
      const { result } = renderHook(() => useSession());
      act(() => {
        result.current.logIn(loginPayload);
      });
      act(() => {
        result.current.setIsLive(true);
      });
      expect(result.current.data.org?.isLive).toBeTruthy();
    });
  });
});
