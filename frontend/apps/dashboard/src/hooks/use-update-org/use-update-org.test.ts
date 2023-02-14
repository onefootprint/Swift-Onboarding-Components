import { customRenderHook, waitFor } from '@onefootprint/test-utils';
import { asAdminUserInSandbox, resetUser } from 'src/config/tests';
import { useStore } from 'src/hooks/use-session';

import { withUpdateOrg } from './udate-update-org.test.config';
import useUpdateOrg from './use-update-org';

describe('useUpdateOrg', () => {
  beforeAll(() => {
    asAdminUserInSandbox();
  });

  afterAll(() => {
    resetUser();
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
