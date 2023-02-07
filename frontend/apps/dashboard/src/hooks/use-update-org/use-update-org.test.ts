import { customRenderHook, waitFor } from '@onefootprint/test-utils';
import { useStore } from 'src/hooks/use-session';

import { withUpdateOrg } from './udate-update-org.test.config';
import useUpdateOrg from './use-update-org';

const originalState = useStore.getState();

describe('useUpdateOrg', () => {
  beforeAll(() => {
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
      },
    });
  });

  afterAll(() => {
    useStore.setState(originalState);
  });

  describe('when the request succeeds', () => {
    beforeEach(() => {
      withUpdateOrg({ name: 'Acme Inc.' });
    });

    it('should update the session', async () => {
      const { result } = customRenderHook(() => useUpdateOrg());
      result.current.mutate({ name: 'Acme Inc.' });

      await waitFor(() => {
        const state = useStore.getState();
        expect(state.data?.org.name).toEqual('Acme Inc.');
      });
    });
  });
});
