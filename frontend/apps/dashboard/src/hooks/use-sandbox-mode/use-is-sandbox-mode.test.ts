import { act, renderHook } from '@onefootprint/test-utils';

import { useStore } from '../use-session-user';
import useIsSandbox from './use-sandbox-mode';

const originalState = useStore.getState();

describe('useIsSandbox', () => {
  afterAll(() => {
    useStore.setState(originalState);
  });

  describe('when it is using a live key', () => {
    beforeEach(() => {
      useStore.setState({
        isLive: true,
      });
    });

    it('should return false', () => {
      const { result } = renderHook(() => useIsSandbox());
      const { isSandbox } = result.current;
      expect(isSandbox).toBeFalsy();
    });
  });

  describe('when it is using a sandbox key', () => {
    beforeEach(() => {
      useStore.setState({
        isLive: false,
      });
    });

    it('should return false', () => {
      const { result } = renderHook(() => useIsSandbox());
      const { isSandbox } = result.current;
      expect(isSandbox).toBeTruthy();
    });

    describe('when is restricted to toggle', () => {
      beforeEach(() => {
        useStore.setState({
          isLive: false,
          data: {
            auth: 'vtok_X7n2zMasfrMSCp8DQJD56cnDojCJUtaUKRzKKF',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@acme.com',
            tenantName: 'Acme Bank',
            sandboxRestricted: true,
          },
        });
      });

      it('should return canToggle = false', () => {
        const { result } = renderHook(() => useIsSandbox());
        const { canToggle } = result.current;
        expect(canToggle).toBeFalsy();
      });
    });
  });

  describe('when toggling', () => {
    beforeEach(() => {
      useStore.setState({
        isLive: false,
      });
    });

    it('should toggle the value', () => {
      const { result } = renderHook(() => useIsSandbox());
      const { isSandbox, toggle } = result.current;
      expect(isSandbox).toBeTruthy();
      act(() => {
        toggle();
      });
      expect(result.current.isSandbox).toBeFalsy();
    });
  });
});
