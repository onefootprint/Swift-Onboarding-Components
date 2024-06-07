import { customRenderHook, screen, waitFor } from '@onefootprint/test-utils';
import { asAdminUserInSandbox, resetUser } from 'src/config/tests';

import useUserSession from './use-user-session';
import { withUpdateUser, withUpdateUserError } from './use-user-session.test.config';

describe('useUserSession', () => {
  beforeEach(() => {
    asAdminUserInSandbox();
    withUpdateUser();
  });

  afterAll(() => {
    resetUser();
  });

  it('should return the data', () => {
    const { result } = customRenderHook(() => useUserSession());

    expect(result.current.dangerouslyCastedData).toMatchObject({
      id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
      email: 'jane.doe@acme.com',
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });

  describe('when updating the data', () => {
    it('should make a request and update the session', async () => {
      const { result } = customRenderHook(() => useUserSession());

      result.current.mutation.mutate({ firstName: 'Jane', lastName: 'Doe' });
      await waitFor(() => {
        expect(result.current.dangerouslyCastedData).toMatchObject({
          id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
          email: 'jane.doe@acme.com',
          firstName: 'Jane',
          lastName: 'Doe',
        });
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        withUpdateUserError();
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
