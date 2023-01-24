import {
  createUseRouterSpy,
  customRender,
  MockDate,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import Members from './members';
import {
  orgMembersFixture,
  orgMembersRelativeTimeFixture,
  withCreateOrgMembers,
  withCreateOrgMembersError,
  withOrgMembers,
  withOrgMembersError,
  withOrgRoles,
  withOrgRolesError,
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

  beforeEach(() => {
    withOrgRoles();
  });

  beforeAll(() => {
    MockDate.set(testDate);
  });

  afterAll(() => {
    MockDate.reset();
  });

  const renderMembers = () =>
    customRender(
      <section>
        <div id="members-actions" />
        <Members />
      </section>,
    );

  const renderMembersAndWaitData = async () => {
    renderMembers();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('when the request to load the members fails', () => {
    beforeEach(() => {
      withOrgMembersError();
    });

    it('should render an error message', async () => {
      renderMembers();

      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('when the request to load the members succeeds', () => {
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

    describe('when inviting a teammate', () => {
      describe('when the request to load the roles fails', () => {
        beforeEach(() => {
          withOrgRolesError();
        });

        it('should render an error message', async () => {
          renderMembersAndWaitData();

          const inviteButton = screen.getByRole('button', {
            name: 'Invite teammates',
          });
          await userEvent.click(inviteButton);

          await waitFor(() => {
            const dialog = screen.getByRole('dialog', {
              name: 'Invite teammates',
            });
            const errorMessage = within(dialog).getByText(
              'Something went wrong',
            );

            expect(errorMessage).toBeInTheDocument();
          });
        });
      });

      describe('when the request to create a member succeeds', () => {
        beforeEach(() => {
          withCreateOrgMembers();
        });

        it('should invite a teammate and display the invited user in the table', async () => {
          renderMembersAndWaitData();

          const inviteButton = screen.getByRole('button', {
            name: 'Invite teammates',
          });
          await userEvent.click(inviteButton);

          const dialog = screen.getByRole('dialog', {
            name: 'Invite teammates',
          });

          await waitFor(() => {
            screen.getByTestId('members-roles-data');
          });

          const emailField = screen.getByLabelText('Email address');
          await userEvent.type(emailField, 'johnny@acme.com');

          // Updated list of members
          withOrgMembers([
            {
              id: 'orguser_IXNDrl9WcqJi18ZUnpMlVO',
              email: 'johnny@acme.com',
              firstName: null,
              lastName: null,
              lastLoginAt: '2023-01-18T17:54:10.668420Z',
              createdAt: '2022-09-19T16:24:35.368337Z',
              roleName: 'Admin',
              roleId: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
            },
          ]);

          const submitButton = screen.getByRole('button', {
            name: 'Invite',
          });
          await userEvent.click(submitButton);

          await waitForElementToBeRemoved(dialog);

          await waitFor(() => {
            const successMessage = screen.getByText(
              'Invitation sent successfully.',
            );
            expect(successMessage).toBeInTheDocument();
          });

          await waitFor(() => {
            const name = screen.getByText('johnny@acme.com');
            expect(name).toBeInTheDocument();
          });
        });
      });

      describe('when the request to create a member fails', () => {
        beforeEach(() => {
          withCreateOrgMembersError();
        });

        it('should show an error message', async () => {
          renderMembersAndWaitData();

          const inviteButton = screen.getByRole('button', {
            name: 'Invite teammates',
          });
          await userEvent.click(inviteButton);

          await waitFor(() => {
            screen.getByTestId('members-roles-data');
          });

          const emailField = screen.getByLabelText('Email address');
          await userEvent.type(emailField, 'johnny@acme.com');

          const submitButton = screen.getByRole('button', {
            name: 'Invite',
          });
          await userEvent.click(submitButton);

          await waitFor(() => {
            const successMessage = screen.getByText("Invitation wasn't sent");
            expect(successMessage).toBeInTheDocument();
          });
        });
      });
    });
  });
});
