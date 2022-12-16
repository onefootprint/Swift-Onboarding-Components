import { customRenderHook, screen, waitFor } from '@onefootprint/test-utils';
import { useStore } from 'src/hooks/use-session';

import useUserSession from './use-user-session';
import { withUser, withUserError } from './use-user-session.test.config';

const originalState = useStore.getState();

describe('useUserSession', () => {
  afterAll(() => {
    useStore.setState(originalState);
  });

  beforeEach(() => {
    withUser();
    useStore.setState({
      data: {
        auth: '1',
        user: {
          email: 'jane.doe@acme.com',
          firstName: '',
          lastName: '',
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
    const { result } = customRenderHook(() => useUserSession());

    expect(result.current.dangerouslyCastedData).toEqual({
      email: 'jane.doe@acme.com',
      firstName: '',
      lastName: '',
    });
  });

  describe('when updating the data', () => {
    it('should make a request and update the session', async () => {
      const { result } = customRenderHook(() => useUserSession());

      result.current.mutation.mutate({ firstName: 'Jane', lastName: 'Doe' });
      await waitFor(() => {
        expect(result.current.dangerouslyCastedData).toEqual({
          email: 'jane.doe@acme.com',
          firstName: '',
          lastName: '',
        });
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        withUserError();
      });

      it('should show an error messsage', async () => {
        const { result } = customRenderHook(() => useUserSession());

        result.current.mutation.mutate({ firstName: 'Jane', lastName: 'Doe' });
        await waitFor(() => {
          const errorMessage = screen.getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });
  });
});
