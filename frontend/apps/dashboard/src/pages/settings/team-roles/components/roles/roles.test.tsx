import {
  MockDate,
  customRender,
  mockRouter,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@onefootprint/test-utils';
import type { Role } from '@onefootprint/types';
import { RoleKind, RoleScopeKind } from '@onefootprint/types';
import { asAdminUser, resetUser } from 'src/config/tests';

import Roles from './roles';
import {
  roleToEdit,
  roleWithoutActiveUsers,
  rolesCreatedAtFixture,
  rolesFixture,
  rolesScopesFixture,
  withCreateRole,
  withCreateRoleError,
  withDisableRole,
  withDisableRoleError,
  withProxyConfigs,
  withRoles,
  withRolesError,
  withUpdateRole,
  withUpdateRoleError,
} from './roles.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const testDate = new Date('2023-01-19T14:10:20.503Z');

describe('<Roles />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/settings');
    mockRouter.query = {
      tab: 'roles',
    };
  });

  beforeEach(() => {
    withProxyConfigs();
    asAdminUser();
  });

  beforeAll(() => {
    MockDate.set(testDate);
  });

  afterAll(() => {
    MockDate.reset();
    resetUser();
  });

  const renderRoles = () =>
    customRender(
      <section>
        <div id="team-roles-actions" />
        <Roles />
      </section>,
    );

  const renderRolesAndWaitData = async () => {
    renderRoles();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('when the request to fetch the org roles fails', () => {
    beforeEach(() => {
      withRolesError();
    });

    it('should show the error message', async () => {
      renderRoles();

      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('when the request to fetch the org roles succeeds', () => {
    beforeEach(() => {
      withRoles();
    });

    it('should show role name, number of active users, number of active api keys, created at, and permissions', async () => {
      await renderRolesAndWaitData();

      rolesFixture.forEach((role, index) => {
        const row = screen.getByRole('row', { name: role.id });

        const name = within(row).getByText(role.name);
        expect(name).toBeInTheDocument();

        const numActiveApiKeys = within(row).getByText(role.numActiveApiKeys);
        expect(numActiveApiKeys).toBeInTheDocument();

        rolesScopesFixture[index].forEach(scope => {
          const tag = within(row).getByText(scope);
          expect(tag).toBeInTheDocument();
        });

        const formattedCreatedAt = rolesCreatedAtFixture[index];
        const createdAt = within(row).getByText(formattedCreatedAt);
        expect(createdAt).toBeInTheDocument();
      });
    });

    describe('when typing on the table search', () => {
      it('should append email to query', async () => {
        await renderRolesAndWaitData();

        const search = screen.getByPlaceholderText('Search...');
        await userEvent.type(search, 'Admin');
        await waitFor(() => {
          expect(mockRouter).toMatchObject({
            query: {
              roles_search: 'Admin',
              tab: 'roles',
            },
          });
        });
      });
    });

    describe('when opening with a member_search query', () => {
      it('should show the search value', async () => {
        mockRouter.query = {
          roles_search: 'Admin',
          tab: 'roles',
        };
        await renderRolesAndWaitData();

        const search = screen.getByPlaceholderText('Search...');
        expect(search).toHaveValue('Admin');
      });
    });

    describe('when creating a role', () => {
      describe('when the request to create a role succeeds', () => {
        beforeEach(() => {
          withCreateRole({
            id: 'Role_aExxJ6XgSBpvqIJ2VcHH6X',
            name: 'Customer Support',
            scopes: [{ kind: RoleScopeKind.read }, { kind: RoleScopeKind.apiKeys }],
            isImmutable: false,
            createdAt: '2022-09-19T16:24:35.367322Z',
            numActiveUsers: 0,
            numActiveApiKeys: 0,
            kind: RoleKind.dashboardUser,
          });
        });

        it('should create a role and show a confirmation message', async () => {
          withRoles([
            ...rolesFixture,
            {
              id: 'Role_aExxJ6XgSBpvqIJ2VcHH6X',
              name: 'Customer Support',
              scopes: [{ kind: RoleScopeKind.read }, { kind: RoleScopeKind.apiKeys }],
              isImmutable: false,
              createdAt: '2022-09-19T16:24:35.367322Z',
              numActiveUsers: 0,
              numActiveApiKeys: 0,
              kind: RoleKind.dashboardUser,
            },
          ]);
          await renderRolesAndWaitData();

          const createButton = screen.getByRole('button', {
            name: 'Create role',
          });
          await userEvent.click(createButton);

          const dialog = screen.getByRole('dialog', {
            name: 'Create role',
          });

          const nameField = screen.getByLabelText('Name');
          await userEvent.type(nameField, 'Customer Support');

          const roleField = screen.getByRole('checkbox', {
            name: 'Manage API keys',
          });
          await userEvent.click(roleField);

          const decryptField = screen.getByRole('checkbox', {
            name: 'Decrypt data',
          });
          await userEvent.click(decryptField);

          const attributesSelect = screen.getByLabelText('Permissible attributes');
          await userEvent.click(attributesSelect);

          const fullNameOption = screen.getByText('Full name');
          await userEvent.click(fullNameOption);

          const submitButton = screen.getByRole('button', {
            name: 'Create',
          });
          await userEvent.click(submitButton);

          await waitFor(() => {
            const confirmationMessage = screen.getByText('Role Customer Support was created successfully.');
            expect(confirmationMessage).toBeInTheDocument();
          });

          await waitFor(() => {
            expect(dialog).not.toBeInTheDocument();
          });

          await waitFor(() => {
            const name = screen.getByText('Customer Support');
            expect(name).toBeInTheDocument();
          });
        });
      });

      describe('when the request to create a role fails', () => {
        beforeEach(() => {
          withCreateRoleError();
        });

        it('should show an error message', async () => {
          await renderRolesAndWaitData();

          const createButton = screen.getByRole('button', {
            name: 'Create role',
          });
          await userEvent.click(createButton);

          const dialog = screen.getByRole('dialog', {
            name: 'Create role',
          });

          const nameField = screen.getByLabelText('Name');
          await userEvent.type(nameField, 'Customer Support');

          const roleField = screen.getByRole('checkbox', {
            name: 'Manage API keys',
          });
          await userEvent.click(roleField);

          const submitButton = screen.getByRole('button', {
            name: 'Create',
          });
          await userEvent.click(submitButton);

          await waitFor(() => {
            const confirmationMessage = screen.getByText('Error creating role');
            expect(confirmationMessage).toBeInTheDocument();
          });

          expect(dialog).toBeInTheDocument();
        });
      });
    });

    describe('when updating a role', () => {
      const updatedRole: Role = {
        ...roleToEdit,
        scopes: [{ kind: RoleScopeKind.read }, { kind: RoleScopeKind.apiKeys }, { kind: RoleScopeKind.manualReview }],
      };
      const rolesWithoutUpdatedRole = rolesFixture.filter(role => role.id !== roleToEdit.id);

      describe('when the request to update a role succeeds', () => {
        beforeEach(() => {
          withUpdateRole(updatedRole);
        });

        it('should edit a role and show a confirmation message', async () => {
          await renderRolesAndWaitData();
          withRoles([...rolesWithoutUpdatedRole, updatedRole]);

          const actionButton = screen.getByRole('button', {
            name: `Open actions for role ${roleToEdit.name}`,
          });
          await userEvent.click(actionButton);

          const editButton = screen.getByText('Edit role');
          await userEvent.click(editButton);
          await waitFor(() => {
            screen.getByRole('dialog', {
              name: 'Edit role',
            });
          });
          const dialog = screen.getByRole('dialog', {
            name: 'Edit role',
          });

          const manualReviewField = screen.getByRole('checkbox', {
            name: 'Perform manual review',
          });
          await userEvent.click(manualReviewField);

          const submitButton = screen.getByRole('button', {
            name: 'Save',
          });
          await userEvent.click(submitButton);

          await waitForElementToBeRemoved(dialog);

          await waitFor(() => {
            const confirmationMessage = screen.getByText(`Role ${roleToEdit.name} was updated successfully.`);
            expect(confirmationMessage).toBeInTheDocument();
          });
        });
      });

      describe('when the request to update a role fails', () => {
        beforeEach(() => {
          withUpdateRoleError(updatedRole);
        });

        it('should show the error message', async () => {
          await renderRolesAndWaitData();
          withRoles([...rolesWithoutUpdatedRole, updatedRole]);

          const actionButton = screen.getByRole('button', {
            name: `Open actions for role ${roleToEdit.name}`,
          });
          await userEvent.click(actionButton);

          const editButton = screen.getByText('Edit role');
          await userEvent.click(editButton);
          await waitFor(() => {
            screen.getByRole('dialog', {
              name: 'Edit role',
            });
          });

          const manualReviewField = screen.getByRole('checkbox', {
            name: 'Perform manual review',
          });
          await userEvent.click(manualReviewField);

          const submitButton = screen.getByRole('button', {
            name: 'Save',
          });
          await userEvent.click(submitButton);

          await waitFor(() => {
            const errorMessage = screen.getByText('Something went wrong');
            expect(errorMessage).toBeInTheDocument();
          });
        });
      });
    });

    describe('when disabling a role with no active users', () => {
      const roleToDisable = roleWithoutActiveUsers;

      describe('when the request to disable a role succeeds', () => {
        beforeEach(() => {
          withDisableRole(roleToDisable.id);
        });

        it('should disable a role and show a confirmation message', async () => {
          await renderRolesAndWaitData();
          withRoles(rolesFixture.filter(role => role.id !== roleToDisable.id));

          const actionButton = screen.getByRole('button', {
            name: `Open actions for role ${roleToDisable.name}`,
          });
          await userEvent.click(actionButton);

          const deleteButton = screen.getByText('Delete role');
          await userEvent.click(deleteButton);
          await waitFor(() => {
            screen.getByRole('dialog', {
              name: 'Delete role',
            });
          });

          const confirmationDialog = screen.getByRole('dialog', {
            name: 'Delete role',
          });

          const submitButton = within(confirmationDialog).getByRole('button', {
            name: 'Yes',
          });
          await userEvent.click(submitButton);
          await waitForElementToBeRemoved(confirmationDialog);

          await waitFor(() => {
            const confirmationMessage = screen.getByText('Role deleted');
            expect(confirmationMessage).toBeInTheDocument();
          });

          const userRemovedName = screen.queryByText(roleToDisable.name);
          await waitForElementToBeRemoved(userRemovedName);
        });
      });

      describe('when the request to disable a role fails', () => {
        beforeEach(() => {
          withDisableRoleError(roleToDisable.id);
        });

        it('should disable a role and show a confirmation message', async () => {
          await renderRolesAndWaitData();

          const actionButton = screen.getByRole('button', {
            name: `Open actions for role ${roleToDisable.name}`,
          });
          await userEvent.click(actionButton);

          const deleteButton = screen.getByText('Delete role');
          await userEvent.click(deleteButton);
          await waitFor(() => {
            screen.getByRole('dialog', {
              name: 'Delete role',
            });
          });

          const confirmationDialog = screen.getByRole('dialog', {
            name: 'Delete role',
          });

          const submitButton = within(confirmationDialog).getByRole('button', {
            name: 'Yes',
          });
          await userEvent.click(submitButton);

          await waitFor(() => {
            const errorMessage = screen.getByText('Something went wrong');
            expect(errorMessage).toBeInTheDocument();
          });
        });
      });
    });
  });
});
