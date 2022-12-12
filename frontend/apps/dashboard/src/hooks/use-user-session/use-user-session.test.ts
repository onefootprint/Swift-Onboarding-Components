import { renderHook } from '@onefootprint/test-utils';
import { useStore } from 'src/hooks/use-session';

import useUserSession from './use-user-session';

const originalState = useStore.getState();

describe('useUserSession', () => {
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
      const { result } = renderHook(() => useUserSession());
      expect(result.current.dangerouslyCastedData).toEqual({
        email: 'jane.doe@acme.com',
        firstName: 'Jane',
        lastName: 'Doe',
      });
    });
  });
});
