import {
  createUseRouterSpy,
  customRender,
  MockDate,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import Members from './members';
import {
  orgMembersFixture,
  orgMembersRelativeTimeFixture,
  withOrgMembers,
  withOrgMembersError,
} from './members.test.config';

const useRouterSpy = createUseRouterSpy();
const testDate = new Date('2023-01-19T14:10:20.503Z');

describe('<Members />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/settings',
      query: {
        tab: 'members',
      },
    });
  });

  beforeAll(() => {
    MockDate.set(testDate);
  });

  afterAll(() => {
    MockDate.reset();
  });

  const renderMembers = () => customRender(<Members />);

  const renderMembersAndWaitData = async () => {
    renderMembers();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('when the request fails', () => {
    beforeEach(() => {
      withOrgMembersError();
    });

    it('should render the error message', async () => {
      renderMembers();

      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('when the request succeeds', () => {
    beforeEach(() => {
      withOrgMembers();
    });

    it('should render the name and email of each member', async () => {
      await renderMembersAndWaitData();
      orgMembersFixture.forEach((member, index) => {
        const name = screen.getByText(`${member.firstName} ${member.lastName}`);
        expect(name).toBeInTheDocument();

        const email = screen.getByText(member.email);
        expect(email).toBeInTheDocument();

        const relativeTime = screen.getByText(
          orgMembersRelativeTimeFixture[index],
        );
        expect(relativeTime).toBeInTheDocument();
      });
    });

    describe('when typing on the table search', () => {
      it('should append email to query', async () => {
        const push = jest.fn();
        useRouterSpy({
          pathname: '/settings',
          query: {
            tab: 'Members',
          },
          push,
        });
        await renderMembersAndWaitData();

        const search = screen.getByPlaceholderText('Search...');
        await userEvent.type(search, 'Jane');
        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            {
              query: {
                member_search: 'Jane',
                tab: 'Members',
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
