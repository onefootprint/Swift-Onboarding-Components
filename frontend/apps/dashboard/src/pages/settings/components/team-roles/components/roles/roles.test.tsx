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

import Roles from './roles';
import {
  orgRolesCreatedAtFixture,
  orgRolesFixture,
  orgRolesScopesFixture,
  orgRoleWithoutActiveUsers,
  withCreateOrgRole,
  withCreateOrgRoleError,
  withDisableOrgRole,
  withDisableOrgRoleError,
  withOrgRoles,
  withOrgRolesError,
} from './roles.test.config';

const useRouterSpy = createUseRouterSpy();
const testDate = new Date('2023-01-19T14:10:20.503Z');

describe('<Roles />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/settings',
      query: {
        tab: 'roles',
      },
    });
  });

  beforeAll(() => {
    MockDate.set(testDate);
  });

  afterAll(() => {
    MockDate.reset();
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

  describe('when the request to fetch the org roles succeeds', () => {
    beforeEach(() => {
      withOrgRoles();
    });

    it('should role name, number of active users, created at and permissions', async () => {
      await renderRolesAndWaitData();
      orgRolesFixture.forEach((role, index) => {
        const name = screen.getByText(role.name);
        expect(name).toBeInTheDocument();

        const numActiveUsers = screen.getByText(role.numActiveUsers);
        expect(numActiveUsers).toBeInTheDocument();

        role.scopes.forEach((scope, scopeIndex) => {
          const scopeText = orgRolesScopesFixture[scopeIndex];
          const permission = screen.getByText(scopeText);
          expect(permission).toBeInTheDocument();
        });

        const formattedCreatedAt = orgRolesCreatedAtFixture[index];
        const createdAt = screen.getByText(formattedCreatedAt);
        expect(createdAt).toBeInTheDocument();
      });
    });

    describe('when typing on the table search', () => {
      it('should append email to query', async () => {
        const push = jest.fn();
        useRouterSpy({
          pathname: '/settings',
          query: {
            tab: 'roles',
          },
          push,
        });
        await renderRolesAndWaitData();

        const search = screen.getByPlaceholderText('Search...');
        await userEvent.type(search, 'Admin');
        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            {
              query: {
                roles_search: 'Admin',
                tab: 'roles',
              },
            },
            undefined,
            { shallow: true },
          );
        });
      });
    });

    describe('when creating a role', () => {
      describe('when the request to create a role succeeds', () => {
        beforeEach(() => {
          withCreateOrgRole({
            id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6X',
            name: 'Customer Support',
            scopes: ['read', 'api_keys'],
            isImmutable: false,
            createdAt: '2022-09-19T16:24:35.367322Z',
            numActiveUsers: 0,
          });
        });

        it('should create a role and show a confirmation message', async () => {
          withOrgRoles([
            ...orgRolesFixture,
            {
              id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6X',
              name: 'Customer Support',
              scopes: ['read', 'api_keys'],
              isImmutable: false,
              createdAt: '2022-09-19T16:24:35.367322Z',
              numActiveUsers: 0,
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

          const attributesSelect = screen.getByLabelText(
            'Permissible attributes',
          );
          await userEvent.click(attributesSelect);

          const fullNameOption = screen.getByText('Full name');
          await userEvent.click(fullNameOption);

          const submitButton = screen.getByRole('button', {
            name: 'Create',
          });
          await userEvent.click(submitButton);

          await waitFor(() => {
            const confirmationMessage = screen.getByText(
              'Role Customer Support was created successfully.',
            );
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
          withCreateOrgRoleError();
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

    describe('when disabling a role with no active users', () => {
      const roleToDisable = orgRoleWithoutActiveUsers;

      describe('when the request to disable a role succeeds', () => {
        beforeEach(() => {
          withDisableOrgRole(roleToDisable.id);
        });

        it('should disable a role and show a confirmation message', async () => {
          await renderRolesAndWaitData();
          withOrgRoles(
            orgRolesFixture.filter(role => role.id !== roleToDisable.id),
          );

          const actionButton = screen.getByRole('button', {
            name: `Open actions for role ${roleToDisable.name}`,
          });
          await userEvent.click(actionButton);

          const removeButton = screen.getByText('Remove role');
          await userEvent.click(removeButton);
          await waitFor(() => {
            screen.getByRole('dialog', {
              name: 'Remove role',
            });
          });

          const confirmationDialog = screen.getByRole('dialog', {
            name: 'Remove role',
          });

          const submitButton = within(confirmationDialog).getByRole('button', {
            name: 'Yes',
          });
          await userEvent.click(submitButton);
          await waitForElementToBeRemoved(confirmationDialog);

          await waitFor(() => {
            const confirmationMessage = screen.getByText('Role removed');
            expect(confirmationMessage).toBeInTheDocument();
          });

          const userRemovedName = screen.queryByText(roleToDisable.name);
          await waitForElementToBeRemoved(userRemovedName);
        });
      });

      describe('when the request to disable a role fails', () => {
        beforeEach(() => {
          withDisableOrgRoleError(roleToDisable.id);
        });

        it('should disable a role and show a confirmation message', async () => {
          await renderRolesAndWaitData();

          const actionButton = screen.getByRole('button', {
            name: `Open actions for role ${roleToDisable.name}`,
          });
          await userEvent.click(actionButton);

          const removeButton = screen.getByText('Remove role');
          await userEvent.click(removeButton);
          await waitFor(() => {
            screen.getByRole('dialog', {
              name: 'Remove role',
            });
          });

          const confirmationDialog = screen.getByRole('dialog', {
            name: 'Remove role',
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

  describe('when the request to fetch the org roles fails', () => {
    beforeEach(() => {
      withOrgRolesError();
    });

    it('should show the error message', async () => {
      renderRoles();

      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
