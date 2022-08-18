import { act, renderHook } from 'test-utils';

import useSessionUser from './use-session-user';

describe('useSessionUser', () => {
  describe('when the state is empty', () => {
    it('should indicate that the user is not logged in', () => {
      const { result } = renderHook(() => useSessionUser());
      expect(result.current.isLoggedIn).toBeFalsy();
    });
  });

  describe('when assigning the user data', () => {
    it('should indicate the user is logged in and return the user data', () => {
      const { result } = renderHook(() => useSessionUser());
      const nextData = {
        auth: '1',
        email: 'lorem',
        firstName: 'Jane',
        lastName: 'Doe',
        tenantName: 'Footprint',
        sandboxRestricted: false,
      };
      act(() => {
        result.current.logIn(nextData);
      });
      expect(result.current.data).toEqual(nextData);
      expect(result.current.isLoggedIn).toBeTruthy();
    });
  });

  describe('when logging out', () => {
    it('Should clear the state and indicate that the user is not logged in anymore', () => {
      const { result } = renderHook(() => useSessionUser());
      const nextData = {
        auth: '1',
        email: 'lorem',
        firstName: 'Jane',
        lastName: 'Doe',
        tenantName: 'Footprint',
        sandboxRestricted: false,
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
});
