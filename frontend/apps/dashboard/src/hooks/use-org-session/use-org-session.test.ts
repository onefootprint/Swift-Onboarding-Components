import { act, renderHook } from '@onefootprint/test-utils';
import { useStore } from 'src/hooks/use-session';

import useOrgSession from './use-org-session';

const originalState = useStore.getState();

describe('useOrgSession', () => {
  afterAll(() => {
    useStore.setState(originalState);
  });

  describe('sandbox', () => {
    beforeEach(() => {
      useStore.setState({
        data: {
          auth: '1',
          user: {
            id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
            email: 'jane.doe@acme.com',
            firstName: 'Jane',
            lastName: 'Doe',
          },
          org: {
            isLive: false,
            logoUrl: null,
            name: 'Acme',
            isSandboxRestricted: true,
          },
          meta: {
            createdNewTenant: false,
            isFirstLogin: false,
            requiresOnboarding: false,
          },
        },
      });
    });

    it('should return the data', () => {
      const { result } = renderHook(() => useOrgSession());

      expect(result.current.dangerouslyCastedData).toEqual({
        isLive: false,
        isSandboxRestricted: true,
        logoUrl: null,
        name: 'Acme',
      });
    });

    it('should indicate is sandbox when is not in live mode', () => {
      const { result } = renderHook(() => useOrgSession());

      expect(result.current.sandbox.isSandbox).toBeTruthy();
    });

    it('should toggle sandbox mode', async () => {
      const { result } = renderHook(() => useOrgSession());
      expect(result.current.sandbox.isSandbox).toBeTruthy();
      act(() => {
        result.current.sandbox.toggle();
      });

      expect(result.current.sandbox.isSandbox).toBeFalsy();
    });

    it('should update', () => {
      const { result } = renderHook(() => useOrgSession());
      expect(result.current.dangerouslyCastedData).toEqual({
        isLive: false,
        isSandboxRestricted: true,
        logoUrl: null,
        name: 'Acme',
      });

      act(() => {
        result.current.sandbox.update({ name: 'Lorem' });
      });
      expect(result.current.dangerouslyCastedData).toEqual({
        isLive: false,
        isSandboxRestricted: true,
        logoUrl: null,
        name: 'Lorem',
      });
    });
  });
});
