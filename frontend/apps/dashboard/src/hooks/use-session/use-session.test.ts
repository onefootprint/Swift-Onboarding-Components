import { act, customRenderHook, mockRequest } from '@onefootprint/test-utils';
import { RoleScopeKind } from '@onefootprint/types';
import { resetUser } from 'src/config/tests';

import useSession from './use-session';

const loginPayload = {
  auth: '1',
  meta: {
    createdNewTenant: false,
    isFirstLogin: false,
    requiresOnboarding: false,
  },
};

const getOrgMemberResponse = {
  id: 'orguser_LHX6Nbt32W2gbDrXacVyU',
  email: 'hi@onefootprint.com',
  firstName: 'Piip',
  lastName: 'Penguin',
  isAssumedSession: false,
  scopes: [{ kind: RoleScopeKind.admin }],
  tenant: {
    name: 'Acme',
    logoUrl: null,
    isSandboxRestricted: false,
  },
};

describe('useSession', () => {
  beforeEach(() => {
    resetUser();
    mockRequest({
      method: 'get',
      path: '/org/member',
      response: getOrgMemberResponse,
    });
    mockRequest({
      method: 'post',
      path: '/org/auth/logout',
      response: {},
    });
  });

  describe('when the state is empty', () => {
    it('should indicate that the user is not logged in', () => {
      const { result } = customRenderHook(() => useSession());
      expect(result.current.isLoggedIn).toBeFalsy();
    });
  });

  describe('when logging in', () => {
    it('should indicate the user is logged in and have user and org session data', async () => {
      const { result } = customRenderHook(() => useSession());
      await act(async () => {
        await result.current.logIn(loginPayload);
      });
      expect(result.current.isLoggedIn).toBeTruthy();
      // Make sure the user and org are updated
      expect(result.current.data.user).toBeDefined();
      expect(result.current.data.user?.id).toEqual('orguser_LHX6Nbt32W2gbDrXacVyU');
      expect(result.current.data.user?.email).toEqual('hi@onefootprint.com');
      expect(result.current.data.user?.firstName).toEqual('Piip');
      expect(result.current.data.user?.lastName).toEqual('Penguin');
      expect(result.current.data.user?.isAssumedSession).toEqual(false);
      expect(result.current.data.user?.scopes[0].kind).toEqual(RoleScopeKind.admin);
      expect(result.current.data.org).toEqual({
        isLive: false,
        isSandboxRestricted: false,
        logoUrl: null,
        name: 'Acme',
      });
    });
  });

  describe('when completing the onboarding', () => {
    it('should indicate the user has completed the onboarding', async () => {
      const { result } = customRenderHook(() => useSession());
      await act(async () => {
        await result.current.logIn(loginPayload);
      });
      act(() => {
        result.current.completeOnboarding();
      });
      expect(result.current.data?.meta.requiresOnboarding).toBeFalsy();
    });
  });

  describe('when logging out', () => {
    it('should indicate the user is logged out and return an undefined session data', async () => {
      const { result } = customRenderHook(() => useSession());
      await act(async () => {
        await result.current.logIn(loginPayload);
      });
      act(() => {
        result.current.logOut();
      });
      expect(result.current.data.user).toBeUndefined();
      expect(result.current.isLoggedIn).toBeFalsy();
    });
  });

  describe('when updating is live', () => {
    it('should update correctly', async () => {
      const { result } = customRenderHook(() => useSession());
      await act(async () => {
        await result.current.logIn(loginPayload);
      });
      expect(result.current.data.org?.isLive).toBeFalsy();
      await act(async () => {
        await result.current.setIsLive(true);
      });
      expect(result.current.data.org?.isLive).toBeTruthy();
    });
  });

  describe('when updating the org name', () => {
    it('should update', async () => {
      const { result } = customRenderHook(() => useSession());
      await act(async () => {
        await result.current.logIn(loginPayload);
      });

      expect(result.current.dangerouslyCastedData.org).toEqual({
        isLive: false,
        isSandboxRestricted: false,
        logoUrl: null,
        name: 'Acme',
      });

      act(() => {
        result.current.setOrg({ name: 'Lorem' });
      });
      expect(result.current.dangerouslyCastedData.org).toEqual({
        isLive: false,
        isSandboxRestricted: false,
        logoUrl: null,
        name: 'Lorem',
      });
    });
  });

  describe('when updating the user name', () => {
    it('should update', async () => {
      const { result } = customRenderHook(() => useSession());
      await act(async () => {
        await result.current.logIn(loginPayload);
      });

      expect(result.current.dangerouslyCastedData.user.firstName).toEqual('Piip');
      expect(result.current.dangerouslyCastedData.user.lastName).toEqual('Penguin');

      act(() => {
        result.current.updateUserName({
          firstName: 'Lorem',
          lastName: 'Ipsum',
        });
      });
      expect(result.current.dangerouslyCastedData.user.firstName).toEqual('Lorem');
      expect(result.current.dangerouslyCastedData.user.lastName).toEqual('Ipsum');
    });
  });
});
