import { act, renderHook } from '@onefootprint/test-utils';

import useSession from './use-session';

const user = {
  id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
  email: 'jane.doe@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
  lastLoginAt: '2022-11-07T23:39:54.073430Z',
  createdAt: '2022-11-07T23:39:54.073430Z',
  roleName: 'Admin',
  roleId: 'orgrole_iGj82m9nFhtlVsNETOAZ7',
};

const tenant = {
  id: 'org_0912ufkdsmk1l2oedASDF',
  name: 'Acme',
  logoUrl: null,
  isSandboxRestricted: false,
  websiteUrl: null,
  companySize: null,
};

describe('useSession', () => {
  describe('when the state is empty', () => {
    it('should indicate that the user is not logged in', () => {
      const { result } = renderHook(() => useSession());
      expect(result.current.isLoggedIn).toBeFalsy();
    });
  });

  describe('when logging in', () => {
    it('should indicate the user is logged in and return the session data', () => {
      const { result } = renderHook(() => useSession());
      const expectedData = {
        auth: '1',
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        org: {
          isLive: true,
          name: tenant.name,
          isSandboxRestricted: tenant.isSandboxRestricted,
          logoUrl: tenant.logoUrl,
        },
      };
      act(() => {
        result.current.logIn('1', user, tenant);
      });
      expect(result.current.data).toEqual(expectedData);
      expect(result.current.isLoggedIn).toBeTruthy();
    });
  });

  describe('when logging out', () => {
    it('should indicate the user is logged out and return an undefined session data', () => {
      const { result } = renderHook(() => useSession());
      act(() => {
        result.current.logIn('1', user, tenant);
      });
      act(() => {
        result.current.logOut();
      });
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoggedIn).toBeFalsy();
    });
  });

  describe('when updating the org', () => {
    it('should update correctly', () => {
      const { result } = renderHook(() => useSession());
      act(() => {
        result.current.logIn('1', user, tenant);
      });
      act(() => {
        result.current.setOrg({ isLive: true });
      });
      expect(result.current.data?.org.isLive).toBeTruthy();
    });
  });
});
