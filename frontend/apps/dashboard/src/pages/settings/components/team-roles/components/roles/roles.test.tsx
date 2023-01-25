import {
  createUseRouterSpy,
  customRender,
  MockDate,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import Roles from './roles';
import {
  orgRolesCreatedAtFixture,
  orgRolesFixture,
  orgRolesScopesFixture,
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

  describe('when the request to fetch the org roles fails', () => {
    beforeEach(() => {
      withOrgRolesError();
    });

    it('should render the error message', async () => {
      renderRoles();

      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('when the request to fetch the org roles succeeds', () => {
    beforeEach(() => {
      withOrgRoles();
    });

    it('should role name, created at and permissions', async () => {
      await renderRolesAndWaitData();
      orgRolesFixture.forEach((role, index) => {
        const name = screen.getByText(role.name);
        expect(name).toBeInTheDocument();

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
      it('should open the create dialog', async () => {
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

        const submitButton = screen.getByRole('button', {
          name: 'Create',
        });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(dialog).not.toBeInTheDocument();
        });
      });
    });
  });
});
