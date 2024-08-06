import { createUseRouterSpy, customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { asAdminUserFirmEmployee, asAdminUserInLive, resetUser } from 'src/config/tests';
import { useStore } from 'src/hooks/use-session';

import SideNav from './side-nav';
import {
  getOrgAuthRoleFixture,
  withEntities,
  withOrgAssumeRole,
  withOrgAssumeRoleError,
  withOrgAuthRolesError,
  withRiskSignals,
  withSevenOrgAuthRoles,
  withTwoOrgAuthRoles,
} from './side-nav.test.config';

const useRouterSpy = createUseRouterSpy();
const AUTH_METHOD_NOT_SUPPORTED_TEXT = (tenantName: string) =>
  `${tenantName} has disabled the ability to log in using this auth method. Please retry using another method.`;

describe('<SideNav />', () => {
  beforeEach(() => {
    useRouterSpy({ pathname: '/' });
    withEntities();
    withTwoOrgAuthRoles();
    asAdminUserInLive();
    withRiskSignals();
  });

  afterAll(() => {
    resetUser();
  });

  const renderSideNav = () => customRender(<SideNav />);

  describe('NavDropdown', () => {
    describe('when the request to fetch the tenants fails', () => {
      it('should not show tenant list', async () => {
        withOrgAuthRolesError();
        renderSideNav();

        const navDropdownButton = screen.getByTestId('nav-dropdown-button');
        await userEvent.click(navDropdownButton);

        await waitFor(() => {
          const tenantsListTitle = screen.queryByText('Tenants');
          expect(tenantsListTitle).not.toBeInTheDocument();
        });

        await waitFor(() => {
          const tenantItems = screen.queryAllByTestId('tenant-item');
          expect(tenantItems).toHaveLength(0);
        });
      });
    });

    describe('when the request to fetch the tenants succeeds', () => {
      it('should show a list of tenants', async () => {
        renderSideNav();

        const navDropdownButton = screen.getByTestId('nav-dropdown-button');
        await userEvent.click(navDropdownButton);

        await waitFor(() => {
          const tenantsListTitle = screen.getByText('Tenants');
          expect(tenantsListTitle).toBeInTheDocument();
        });

        await waitFor(() => {
          getOrgAuthRoleFixture.slice(0, 2).forEach(tenant => {
            expect(screen.getByRole('button', { name: tenant.name })).toBeInTheDocument();
          });

          const tenantItems = screen.getAllByTestId('tenant-item');
          expect(tenantItems).toHaveLength(2);
        });
      });

      it('should show a Tooltip if the tenant does not support the auth method', async () => {
        renderSideNav();

        const navDropdownButton = screen.getByTestId('nav-dropdown-button');
        await userEvent.click(navDropdownButton);

        await waitFor(() => {
          const authSupportedTenant = screen.getByRole('button', {
            name: 'Acme',
          });
          expect(authSupportedTenant).toBeInTheDocument();
        });
        const authSupportedTenant = screen.getByRole('button', {
          name: 'Acme',
        });
        await userEvent.hover(authSupportedTenant);
        await waitFor(() => {
          const tooltipText = screen.queryByText(AUTH_METHOD_NOT_SUPPORTED_TEXT('Acme'));
          expect(tooltipText).not.toBeInTheDocument();
        });

        const authNotSupportedTenant = screen.getByRole('button', {
          name: 'No Auth Tenant',
        });
        await waitFor(() => {
          expect(authNotSupportedTenant).toBeInTheDocument();
        });
        await userEvent.hover(authNotSupportedTenant);
        await waitFor(() => {
          const tooltipText = screen.getAllByText(AUTH_METHOD_NOT_SUPPORTED_TEXT('No Auth Tenant'));
          expect(tooltipText[0]).toBeInTheDocument();
        });
      });

      it('should log in as that tenant when clicked', async () => {
        withSevenOrgAuthRoles();
        withOrgAssumeRole();
        renderSideNav();

        const navDropdownButton = screen.getByTestId('nav-dropdown-button');
        await userEvent.click(navDropdownButton);

        const tenant = getOrgAuthRoleFixture[2];
        await waitFor(() => {
          expect(screen.getByRole('button', { name: tenant.name })).toBeInTheDocument();
        });
        const tenantButton = screen.getByRole('button', {
          name: tenant.name,
        });
        await userEvent.click(tenantButton);

        await waitFor(() => {
          expect(useStore.getState().data).toBeDefined();
        });
      });

      it('should show toast if there was an error in logging in as the clicked tenant', async () => {
        withSevenOrgAuthRoles();
        withOrgAssumeRoleError();
        renderSideNav();

        const navDropdownButton = screen.getByTestId('nav-dropdown-button');
        await userEvent.click(navDropdownButton);

        const tenant = getOrgAuthRoleFixture[2];
        await waitFor(() => {
          expect(screen.getByRole('button', { name: tenant.name })).toBeInTheDocument();
        });
        const tenantButton = screen.getByRole('button', {
          name: tenant.name,
        });
        await userEvent.click(tenantButton);

        await waitFor(() => {
          expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        });
      });

      it('should only show all >5 tenants when Show All button is clicked', async () => {
        withSevenOrgAuthRoles();
        renderSideNav();

        const navDropdownButton = screen.getByTestId('nav-dropdown-button');
        await userEvent.click(navDropdownButton);

        await waitFor(() => {
          const tenantsListTitle = screen.getByText('Tenants');
          expect(tenantsListTitle).toBeInTheDocument();
        });
        await waitFor(() => {
          getOrgAuthRoleFixture.slice(0, 5).forEach(tenant => {
            expect(screen.getByRole('button', { name: tenant.name })).toBeInTheDocument();
          });

          const tenantItems = screen.getAllByTestId('tenant-item');
          expect(tenantItems).toHaveLength(5);
        });

        await waitFor(() => {
          const showAllButton = screen.getByText('Show all');
          expect(showAllButton).toBeInTheDocument();
        });
        await userEvent.click(screen.getByText('Show all'));

        await waitFor(() => {
          getOrgAuthRoleFixture.forEach(tenant => {
            expect(screen.getByRole('button', { name: tenant.name })).toBeInTheDocument();
          });

          const tenantItems = screen.getAllByTestId('tenant-item');
          expect(tenantItems).toHaveLength(7);
        });

        await waitFor(() => {
          const showLessButton = screen.getByText('Show less');
          expect(showLessButton).toBeInTheDocument();
        });
        const showLessButton = screen.getByText('Show less');
        await userEvent.click(showLessButton);

        await waitFor(() => {
          getOrgAuthRoleFixture.slice(0, 5).forEach(tenant => {
            expect(screen.getByRole('button', { name: tenant.name })).toBeInTheDocument();
          });

          const tenantItems = screen.getAllByTestId('tenant-item');
          expect(tenantItems).toHaveLength(5);
        });
        await waitFor(() => {
          expect(screen.getByText('Show all')).toBeInTheDocument();
        });
      });
    });
  });

  describe('when it is not a firm employee', () => {
    it('should not show the super admin mode button', async () => {
      renderSideNav();

      const tenants = screen.queryByText('Tenants');
      expect(tenants).not.toBeInTheDocument();
    });
  });

  describe('when it is a firm employee', () => {
    beforeEach(() => {
      asAdminUserFirmEmployee();
    });

    it('should show the super admin mode button', async () => {
      renderSideNav();

      const tenants = screen.queryByText('Tenants');
      expect(tenants).toBeInTheDocument();
    });
  });
});
