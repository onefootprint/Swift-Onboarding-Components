import { act, renderHook } from '@onefootprint/test-utils';

import useSession from './use-session';

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
      const nextData = {
        auth: '1',
        user: {
          email: 'jane.doe@acme.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
        org: {
          isLive: false,
          name: 'Acme',
          sandboxRestricted: false,
        },
      };
      act(() => {
        result.current.logIn(nextData);
      });
      expect(result.current.data).toEqual(nextData);
      expect(result.current.isLoggedIn).toBeTruthy();
    });
  });

  describe('when logging out', () => {
    it('should indicate the user is logged out and return an undefined session data', () => {
      const { result } = renderHook(() => useSession());
      const nextData = {
        auth: '1',
        user: {
          email: 'jane.doe@acme.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
        org: {
          isLive: false,
          name: 'Acme',
          sandboxRestricted: false,
        },
      };
      act(() => {
        result.current.logIn(nextData);
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
      const nextData = {
        auth: '1',
        user: {
          email: 'jane.doe@acme.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
        org: {
          isLive: false,
          name: 'Acme',
          sandboxRestricted: false,
        },
      };
      act(() => {
        result.current.logIn(nextData);
      });
      act(() => {
        result.current.setOrg({ isLive: true });
      });
      expect(result.current.data?.org.isLive).toBeTruthy();
    });
  });
});
