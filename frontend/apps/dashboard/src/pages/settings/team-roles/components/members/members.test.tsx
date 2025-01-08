import {
  MockDate,
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';

import type { OrganizationMember } from '@onefootprint/request-types/dashboard';
import Members from './members';
import {
  RolesFixture,
  memberToEdit,
  memberToEditRole,
  membersFixture,
  membersRelativeTimeFixture,
  withCreateMembers,
  withCreateMembersError,
  withEditMember,
  withEditMemberError,
  withMembers,
  withMembersError,
  withRemoveMember,
  withRemoveMemberError,
  withRoles,
  withRolesError,
} from './members.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const testDate = new Date('2023-01-19T14:10:20.503Z');

describe('<Members />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/settings');
    mockRouter.query = {
      tab: 'members',
    };
  });

  beforeEach(() => {
    withRoles();
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
        <div id="team-roles-actions" />
        <Members />
      </section>,
    );

  const renderMembersAndWaitData = async () => {
    renderMembers();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isPending = table.getAttribute('aria-busy');
      expect(isPending).toBe('false');
    });
  };

  describe('when the request to fetch the members fails', () => {
    beforeEach(() => {
      withMembersError();
    });

    it('should show an error message', async () => {
      renderMembers();

      const errorMessage = await screen.findByText('Something went wrong');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('when the request to fetch the members succeeds', () => {
    beforeEach(() => {
      withMembers();
    });

    it('should render the name, email, and last login of each member', async () => {
      await renderMembersAndWaitData();

      membersFixture.forEach((member, index) => {
        const name = screen.getByText(`${member.firstName} ${member.lastName}`);
        expect(name).toBeInTheDocument();

        const email = screen.getByText(member.email);
        expect(email).toBeInTheDocument();

        const relativeTime = screen.getByText(membersRelativeTimeFixture[index]);
        expect(relativeTime).toBeInTheDocument();
      });
    });

    describe('when typing on the table search', () => {
      it('should append members_search query', async () => {
        await renderMembersAndWaitData();

        const search = screen.getByPlaceholderText('Search...');
        await userEvent.type(search, 'Jane');
        await waitFor(() => {
          expect(mockRouter).toMatchObject({
            query: {
              members_search: 'Jane',
            },
          });
        });
      });
    });

    describe('when opening with a member_search query', () => {
      it('should render the search input with the query value', async () => {
        mockRouter.query = {
          members_search: 'Jane',
          tab: 'Members',
        };
        await renderMembersAndWaitData();

        const search = screen.getByPlaceholderText('Search...');
        expect(search).toHaveValue('Jane');
      });
    });

    describe('when applying a filter by role', () => {
      const [firstRole] = RolesFixture;

      it('should append members_role query', async () => {
        await renderMembersAndWaitData();

        const filterTrigger = screen.getByRole('button', {
          name: 'Role',
        });
        await userEvent.click(filterTrigger);

        const filterDialog = screen.getByRole('dialog', {
          name: 'Filter by Role',
        });
        const checkbox = within(filterDialog).getByLabelText(firstRole.name);
        await userEvent.click(checkbox);

        const submitButton = within(filterDialog).getByRole('button', {
          name: 'Apply',
        });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(mockRouter).toMatchObject({
            query: {
              members_role: [firstRole.id],
            },
          });
        });
      });
    });

    describe('when inviting a member', () => {
      describe('when the request to load the roles fails', () => {
        beforeEach(() => {
          withRolesError();
        });

        it('should show an error message', async () => {
          await renderMembersAndWaitData();

          const inviteButton = screen.getByRole('button', {
            name: 'Invite teammates',
          });
          await userEvent.click(inviteButton);

          const dialog = await screen.findByRole('dialog', {
            name: 'Invite teammates',
          });
          const errorMessage = await within(dialog).getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });

      describe('when the request to create a member succeeds', () => {
        beforeEach(() => {
          withCreateMembers();
        });

        it('should invite a teammate and display the invited user in the table', async () => {
          await renderMembersAndWaitData();

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
          withMembers([
            ...membersFixture,
            {
              id: 'orguser_IXNDrl9WcqJi18ZUnpMlVO',
              email: 'johnny@acme.com',
              firstName: undefined,
              lastName: undefined,
              role: {
                createdAt: '2022-09-19T16:24:34.368337Z',
                id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
                isImmutable: true,
                name: 'Admin',
                numActiveUsers: 1,
                numActiveApiKeys: 0,
                scopes: [{ kind: 'admin' }],
                kind: 'dashboard_user',
              },
              rolebinding: {
                lastLoginAt: '2023-01-18T17:54:10.668420Z',
              },
            } as OrganizationMember,
          ]);

          const submitButton = screen.getByRole('button', {
            name: 'Invite',
          });
          await userEvent.click(submitButton);

          await waitForElementToBeRemoved(dialog);

          const successMessage = await screen.findByText('Invitation sent successfully.');
          expect(successMessage).toBeInTheDocument();

          const name = await screen.findByText('johnny@acme.com');
          expect(name).toBeInTheDocument();
        });
      });

      describe('when the request to create a member fails', () => {
        beforeEach(() => {
          withCreateMembersError();
        });

        it('should show an error message', async () => {
          await renderMembersAndWaitData();

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

          const successMessage = await screen.findByText("Invitation wasn't sent");
          expect(successMessage).toBeInTheDocument();
        });
      });
    });

    describe('when editing a member role', () => {
      describe('when the request to edit the member role fails', () => {
        beforeEach(() => {
          withEditMemberError(memberToEdit);
        });

        it('should show an error message', async () => {
          await renderMembersAndWaitData();

          const roleButton = screen.getByRole('combobox', {
            name: `Change ${memberToEdit.email} role`,
          });
          await userEvent.click(roleButton);

          const newRoleOption = await screen.findByText(memberToEditRole.name);
          expect(newRoleOption).toBeInTheDocument();
          await userEvent.click(newRoleOption);

          const errorMessage = await screen.findByText('Error updating role');
          expect(errorMessage).toBeInTheDocument();
        });
      });

      describe('when the request to edit the member succeeds', () => {
        beforeEach(() => {
          withEditMember(memberToEdit, memberToEditRole);
        });

        it('should update the member role', async () => {
          await renderMembersAndWaitData();

          const roleButton = screen.getByRole('combobox', {
            name: `Change ${memberToEdit.email} role`,
          });
          await userEvent.click(roleButton);

          const newRoleOption = await screen.findByText(memberToEditRole.name);
          expect(newRoleOption).toBeInTheDocument();
          await userEvent.click(newRoleOption);

          const newRole = await screen.findByText(memberToEditRole.name);
          expect(newRole).toBeInTheDocument();
        });
      });
    });

    describe('when removing a member', () => {
      describe('when the request to remove a member fails', () => {
        const [userToRemove] = membersFixture;

        beforeEach(() => {
          withRemoveMemberError(userToRemove.id);
        });

        it('should show an error message', async () => {
          await renderMembersAndWaitData();

          const actionButton = screen.getByRole('button', {
            name: `Open actions for member ${userToRemove.email}`,
          });
          await userEvent.click(actionButton);

          const removeButton = screen.getByText('Remove');
          await userEvent.click(removeButton);

          const confirmationDialog = await screen.findByRole('dialog', {
            name: 'Remove team member',
          });
          const submitButton = await within(confirmationDialog).findByRole('button', {
            name: 'Yes',
          });
          await userEvent.click(submitButton);

          const errorMessage = await screen.findByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });

      describe('when the request to remove a member succeeds', () => {
        const userToRemove = membersFixture[1];

        beforeEach(() => {
          withRemoveMember(userToRemove.id);
        });

        it('should remove the member and update the list', async () => {
          await renderMembersAndWaitData();

          const actionButton = screen.getByRole('button', {
            name: `Open actions for member ${userToRemove.email}`,
          });
          await userEvent.click(actionButton);

          const removeButton = screen.getByText('Remove');
          await userEvent.click(removeButton);

          const confirmationDialog = await screen.findByRole('dialog', {
            name: 'Remove team member',
          });

          // Necessary to mock the fetch request without the user removed
          const updatedMembers = membersFixture.filter(m => m.id !== userToRemove.id);
          withMembers(updatedMembers);

          const submitButton = await within(confirmationDialog).findByRole('button', {
            name: 'Yes',
          });
          await userEvent.click(submitButton);
          await waitForElementToBeRemoved(confirmationDialog);

          const confirmationMessage = await screen.findByText('Team member removed');
          expect(confirmationMessage).toBeInTheDocument();

          await waitFor(() => {
            const userRemovedName = screen.queryByText(`${userToRemove.firstName} ${userToRemove.lastName}`);
            expect(userRemovedName).not.toBeInTheDocument();
          });
        });
      });
    });
  });
});
