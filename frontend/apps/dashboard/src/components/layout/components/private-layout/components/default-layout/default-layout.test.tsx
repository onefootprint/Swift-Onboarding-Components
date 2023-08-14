import {
  createUseRouterSpy,
  customRender,
  mockRequest,
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
    mockRequest({
      method: 'get',
      path: '/entities',
      response: { data: [] },
    });
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
  });
});
