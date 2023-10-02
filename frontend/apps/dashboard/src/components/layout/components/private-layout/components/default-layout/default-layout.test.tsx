import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';
import {
  asAdminUserInLive,
  asAdminUserInSandbox,
  asAdminUserInSandboxAndRestricted,
} from 'src/config/tests';

import DefaultLayout from './default-layout';
import { withEntities, withOrgAuthRoles } from './default-layout.test.config';

const renderDefaultLayout = () =>
  customRender(
    <DefaultLayout>
      <div>test children</div>
    </DefaultLayout>,
  );

const SANDBOX_MODE_TEXT = "You're in sandbox mode. To activate your account,";
const useRouterSpy = createUseRouterSpy();

describe('<DefaultLayout />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/users',
    });
    withEntities();
    withOrgAuthRoles();
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
    it('should go from the sandbox to the live mode', async () => {
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
        asAdminUserInLive();
        const id = 'fp_id_ub0TUlzLv3dyoJbaxlObCe';
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/users/detail',
          query: {
            id,
          },
          push: pushMockFn,
        });
        renderDefaultLayout();

        expect(screen.queryByText(SANDBOX_MODE_TEXT)).not.toBeInTheDocument();

        const toggle = screen.getByRole('switch', { name: 'Sandbox mode' });
        await userEvent.click(toggle);
        await waitFor(() => {
          expect(pushMockFn).toHaveBeenCalledWith({
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
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/businesses/detail',
        query: {
          id,
        },
        push: pushMockFn,
      });
      renderDefaultLayout();

      expect(screen.queryByText(SANDBOX_MODE_TEXT)).not.toBeInTheDocument();

      const toggle = screen.getByRole('switch', { name: 'Sandbox mode' });
      await userEvent.click(toggle);
      await waitFor(() => {
        expect(pushMockFn).toHaveBeenCalledWith({
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
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/businesses/detail',
        query: {
          date_range: ['last-30-days'],
          status: ['pass', 'fail', 'incomplete', 'none'],
          id,
        },
        push: pushMockFn,
      });
      renderDefaultLayout();

      expect(screen.queryByText(SANDBOX_MODE_TEXT)).not.toBeInTheDocument();

      const toggle = screen.getByRole('switch', { name: 'Sandbox mode' });
      await userEvent.click(toggle);
      await waitFor(() => {
        expect(pushMockFn).toHaveBeenCalledWith({
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
});
