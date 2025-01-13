import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import {
  asAdminUserFirmEmployee,
  asAdminUserInLive,
  asAdminUserInSandbox,
  asAdminUserInSandboxAndRestricted,
  asAssumedUser,
} from 'src/config/tests';

import DefaultLayout from './default-layout';
import {
  withEntities,
  withGhostPosts,
  withMembersAdmin,
  withMembersRead,
  withOrgAuthRoles,
  withPrivateAccessRequests,
  withRiskSignals,
  withRiskSignalsSpec,
} from './default-layout.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const renderDefaultLayout = () =>
  customRender(
    <DefaultLayout>
      <div>test children</div>
    </DefaultLayout>,
  );

const SANDBOX_MODE_TEXT = "You're in sandbox mode.";

describe('<DefaultLayout />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/users');
  });

  beforeEach(() => {
    withEntities();
    withOrgAuthRoles();
    withRiskSignals();
    withMembersRead();
    withGhostPosts();
    withPrivateAccessRequests();
    withRiskSignalsSpec();
  });

  describe('when its restricted to use only the sandbox mode', () => {
    it('should disable the toggle and show a tooltip explaining', async () => {
      asAdminUserInSandboxAndRestricted();
      renderDefaultLayout();

      const toggle = screen.getByRole('switch') as HTMLButtonElement;
      expect(toggle.disabled).toBeTruthy();
    });
  });

  describe('when in sandbox mode', () => {
    it('should go from the sandbox to live mode', async () => {
      asAdminUserInSandbox();
      renderDefaultLayout();

      expect(screen.getByText(SANDBOX_MODE_TEXT)).toBeInTheDocument();

      const toggle = screen.getByRole('switch');
      await userEvent.click(toggle);

      await waitFor(() => {
        expect(screen.queryByText(SANDBOX_MODE_TEXT)).not.toBeInTheDocument();
      });
    });
  });

  describe('when toggling', () => {
    it('should go from live to the sandbox mode', async () => {
      asAdminUserInLive();
      renderDefaultLayout();

      expect(screen.queryByText(SANDBOX_MODE_TEXT)).not.toBeInTheDocument();

      const toggle = screen.getByRole('switch');
      await userEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByText(SANDBOX_MODE_TEXT)).toBeInTheDocument();
      });
    });

    describe('when toggling on details page', () => {
      it('should navigate from user details page back to just users page when toggling sandbox', async () => {
        const id = 'fp_id_ub0TUlzLv3dyoJbaxlObCe';

        asAdminUserInLive();
        mockRouter.setCurrentUrl('/users');
        mockRouter.query = {
          id,
        };

        renderDefaultLayout();
        expect(screen.queryByText(SANDBOX_MODE_TEXT)).not.toBeInTheDocument();

        const toggle = screen.getByRole('switch', { name: 'Sandbox mode' });
        await userEvent.click(toggle);
        await waitFor(() => {
          expect(mockRouter).toMatchObject({
            pathname: '/users',
            query: {},
          });
        });

        await waitFor(() => {
          expect(screen.getByText(SANDBOX_MODE_TEXT)).toBeInTheDocument();
        });
      });
    });

    it('should navigate from business details page back to just business page when toggling sandbox', async () => {
      asAdminUserInLive();
      const id = 'fp_bid_ub0TUlzLv3dyoJbaxlObCe';
      mockRouter.setCurrentUrl('/businesses/detail');
      mockRouter.query = {
        id,
      };

      renderDefaultLayout();
      expect(screen.queryByText(SANDBOX_MODE_TEXT)).not.toBeInTheDocument();

      const toggle = screen.getByRole('switch', { name: 'Sandbox mode' });
      await userEvent.click(toggle);
      await waitFor(() => {
        expect(mockRouter).toMatchObject({
          pathname: '/businesses',
          query: {},
        });
      });
      await waitFor(() => {
        expect(screen.getByText(SANDBOX_MODE_TEXT)).toBeInTheDocument();
      });
    });

    it('should keep query params when toggling to sandbox', async () => {
      asAdminUserInLive();
      const id = 'fp_bid_ub0TUlzLv3dyoJbaxlObCe';
      mockRouter.setCurrentUrl('/businesses/detail');
      mockRouter.query = {
        date_range: ['last-30-days'],
        status: ['pass', 'fail', 'incomplete', 'none'],
        id,
      };

      renderDefaultLayout();

      expect(screen.queryByText(SANDBOX_MODE_TEXT)).not.toBeInTheDocument();

      const toggle = screen.getByRole('switch', { name: 'Sandbox mode' });
      await userEvent.click(toggle);
      await waitFor(() => {
        expect(mockRouter).toMatchObject({
          pathname: '/businesses',
          query: {
            date_range: ['last-30-days'],
            status: ['pass', 'fail', 'incomplete', 'none'],
          },
        });
      });
      await waitFor(() => {
        expect(screen.getByText(SANDBOX_MODE_TEXT)).toBeInTheDocument();
      });
    });
  });

  describe('<AssumeBanner />', () => {
    describe('when not assuming', () => {
      it('should not show banner', async () => {
        asAdminUserFirmEmployee();
        renderDefaultLayout();

        expect(screen.queryByText("You're logged into Acme in view-only mode")).not.toBeInTheDocument();
      });
    });

    describe('when assuming', () => {
      it('should show banner', async () => {
        asAssumedUser();
        renderDefaultLayout();

        expect(screen.getByText("You're logged into Acme in view-only mode")).toBeInTheDocument();
      });
    });

    describe('when user has write permissions while impersonating', () => {
      it('allow enabling edit mode', async () => {
        withMembersAdmin();
        asAssumedUser();
        renderDefaultLayout();

        expect(screen.getByText("You're logged into Acme in view-only mode")).toBeInTheDocument();
        await waitFor(() => {
          expect(screen.getByText('Request edit mode')).toBeEnabled();
        });
      });
    });
  });
});
