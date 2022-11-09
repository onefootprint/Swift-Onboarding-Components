import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import People from './people';
import withOrgMembers from './people.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<People />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/settings',
      query: {},
    });
  });

  const renderPeople = () => customRender(<People />);

  const renderPeopleAndWaitData = async () => {
    renderPeople();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('when filtering', () => {
    beforeAll(() => {
      withOrgMembers();
    });

    describe('when typing on the table search', () => {
      it('should append role to query', async () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/settings',
          query: {},
          push: pushMockFn,
        });
        await renderPeopleAndWaitData();

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
