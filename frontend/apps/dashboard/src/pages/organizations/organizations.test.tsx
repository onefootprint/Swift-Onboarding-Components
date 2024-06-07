import { createUseRouterSpy, customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';
import { useStore } from 'src/hooks/use-session';

import Organizations from './organizations';
import {
  getOrgAuthRoleFixture,
  withOrgAssumeRole,
  withOrgAssumeRoleError,
  withOrgAuthRoles,
  withOrgAuthRolesError,
} from './organizations.test.config';

const originalState = useStore.getState();

const useRouterSpy = createUseRouterSpy();

describe('<Organizations />', () => {
  afterAll(() => {
    useStore.setState(originalState);
  });

  const renderOrganizations = () => {
    customRender(<Organizations />);
  };

  describe('when there is no auth token', () => {
    beforeEach(() => {
      useRouterSpy({
        pathname: '/organizations',
        query: {},
      });
    });

    it('should show an error message', () => {
      renderOrganizations();

      const loader = screen.queryByTestId('organizations-loading');
      expect(loader).not.toBeInTheDocument();

      const errorMessage = screen.getByText('No auth token provided. Please, log in again.');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('when the request fails', () => {
    beforeEach(() => {
      useRouterSpy({
        pathname: '/organizations',
        query: {
          token: 'tok_KjdC7reIHvRDIYMOBzT2hwp67IYXnVK5nP',
        },
      });

      withOrgAuthRolesError();
    });

    it('should show an error message', async () => {
      renderOrganizations();

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('when the request succeeds', () => {
    beforeEach(() => {
      useRouterSpy({
        pathname: '/organizations',
        query: {
          token: 'tok_KjdC7reIHvRDIYMOBzT2hwp67IYXnVK5nP',
        },
      });

      withOrgAuthRoles();
    });

    it('should show the list of organizations', async () => {
      renderOrganizations();
      await waitFor(() => {
        getOrgAuthRoleFixture.forEach(organization => {
          expect(screen.getByRole('button', { name: organization.name })).toBeInTheDocument();
        });
        const [, secondOrg] = getOrgAuthRoleFixture;
        const secondOrgButton = screen.getByRole('button', {
          name: secondOrg.name,
        });
        expect(secondOrgButton).toBeDisabled();
      });
    });

    describe('when clicking on an organization', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          withOrgAssumeRole();
        });

        it('should logIn and redirect to the /users', async () => {
          renderOrganizations();
          const [firstOrg] = getOrgAuthRoleFixture;
          await waitFor(() => {
            expect(screen.getByRole('button', { name: firstOrg.name })).toBeInTheDocument();
          });

          const firstOrgButton = screen.getByRole('button', {
            name: firstOrg.name,
          });
          await userEvent.click(firstOrgButton);

          await waitFor(() => {
            expect(useStore.getState().data).toBeDefined();
          });
        });
      });

      describe('when the request fails', () => {
        beforeEach(() => {
          withOrgAssumeRoleError();
        });

        it('should show an error message', async () => {
          renderOrganizations();
          const [firstOrg] = getOrgAuthRoleFixture;
          await waitFor(() => {
            expect(screen.getByRole('button', { name: firstOrg.name })).toBeInTheDocument();
          });

          const firstOrgButton = screen.getByRole('button', {
            name: firstOrg.name,
          });
          await userEvent.click(firstOrgButton);

          await waitFor(() => {
            expect(screen.getByText('Something went wrong')).toBeInTheDocument();
          });
        });
      });
    });
  });
});
