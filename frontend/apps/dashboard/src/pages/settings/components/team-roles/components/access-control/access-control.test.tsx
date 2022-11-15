import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import AccessControl from './access-control';
import withOrgRoles from './access-control.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<AccessControl />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/settings',
      query: {},
    });
  });

  const renderAccessControl = () => customRender(<AccessControl />);

  const renderAccessControlAndWait = async () => {
    renderAccessControl();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('when filtering', () => {
    beforeAll(() => {
      withOrgRoles();
    });

    describe('when typing on the table search', () => {
      it('should append role to query', async () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/settings',
          query: {},
          push: pushMockFn,
        });
        await renderAccessControlAndWait();

        const search = screen.getByPlaceholderText('Search...');
        await userEvent.type(search, 'lorem');
        await waitFor(() => {
          expect(pushMockFn).toHaveBeenCalledWith(
            {
              query: {
                roles: 'lorem',
              },
            },
            undefined,
            { shallow: true },
          );
        });
      });
    });
  });
});
