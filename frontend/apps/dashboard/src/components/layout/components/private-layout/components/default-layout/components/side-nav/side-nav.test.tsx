import { customRender, mockRouter, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { asAdminUserFirmEmployee, asAdminUserInLive } from 'src/config/tests';
import { useStore } from 'src/hooks/use-session';

import SideNav from './side-nav';
import {
  getOrgAuthRoleFixture,
  withEntities,
  withGhostPosts,
  withOrgAssumeRole,
  withOrgAssumeRoleError,
  withOrgAuthRolesError,
  withRiskSignals,
  withSevenOrgAuthRoles,
  withTwoOrgAuthRoles,
} from './side-nav.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<SideNav />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
  });

  beforeEach(() => {
    withEntities();
    withTwoOrgAuthRoles();
    asAdminUserInLive();
    withRiskSignals();
    withGhostPosts();
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
          const tenantItems = screen.queryAllByRole('menuitemradio');
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
            expect(screen.getByRole('menuitemradio', { name: tenant.name })).toBeInTheDocument();
          });

          const tenantItems = screen.getAllByRole('menuitemradio');
          expect(tenantItems).toHaveLength(2);
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
          expect(screen.getByRole('menuitemradio', { name: tenant.name })).toBeInTheDocument();
        });
        const tenantButton = screen.getByRole('menuitemradio', {
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
          expect(screen.getByRole('menuitemradio', { name: tenant.name })).toBeInTheDocument();
        });
        const tenantButton = screen.getByRole('menuitemradio', {
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
            expect(screen.getByRole('menuitemradio', { name: tenant.name })).toBeInTheDocument();
          });

          const tenantItems = screen.getAllByRole('menuitemradio');
          expect(tenantItems).toHaveLength(5);
        });

        await waitFor(() => {
          const showAllButton = screen.getByText('Show all');
          expect(showAllButton).toBeInTheDocument();
        });
        await userEvent.click(screen.getByText('Show all'));

        await waitFor(() => {
          getOrgAuthRoleFixture.forEach(tenant => {
            expect(screen.getByRole('menuitemradio', { name: tenant.name })).toBeInTheDocument();
          });

          const tenantItems = screen.getAllByRole('menuitemradio');
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
            expect(screen.getByRole('menuitemradio', { name: tenant.name })).toBeInTheDocument();
          });

          const tenantItems = screen.getAllByRole('menuitemradio');
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

  describe('when opening settings pages', () => {
    beforeAll(() => {
      window.scrollTo = jest.fn();
    });

    it('should show expanded settings menu when on /settings/business-profile', async () => {
      mockRouter.setCurrentUrl('/settings/business-profile');
      renderSideNav();

      const businessProfile = await screen.findByRole('link', { name: 'Business profile' });
      expect(businessProfile).toBeInTheDocument();

      const teamAndRoles = await screen.findByRole('link', { name: 'Team & Roles' });
      expect(teamAndRoles).toBeInTheDocument();
    });

    it('should show expanded settings menu when on /settings/team-roles', async () => {
      mockRouter.setCurrentUrl('/settings/team-roles');
      renderSideNav();

      const businessProfile = await screen.findByRole('link', { name: 'Business profile' });
      expect(businessProfile).toBeInTheDocument();

      const teamAndRoles = await screen.findByRole('link', { name: 'Team & Roles' });
      expect(teamAndRoles).toBeInTheDocument();
    });

    it('should not show expanded settings menu when on a different page', async () => {
      mockRouter.setCurrentUrl('/dashboard');
      renderSideNav();

      const businessProfile = screen.queryByRole('link', { name: 'Business profile' });
      expect(businessProfile).not.toBeInTheDocument();

      const teamAndRoles = screen.queryByRole('link', { name: 'Team & Roles' });
      expect(teamAndRoles).not.toBeInTheDocument();
    });
  });
});
