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
            email: 'jane.doe@acme.com',
            firstName: 'Jane',
            lastName: 'Doe',
          },
          org: {
            isLive: false,
            name: 'Acme',
            sandboxRestricted: false,
          },
        },
      });
    });

    it('should return the data', () => {
      const { result } = renderHook(() => useOrgSession());
      expect(result.current.dangerouslyCastedData).toEqual({
        isLive: false,
        name: 'Acme',
        sandboxRestricted: false,
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
  });
});
