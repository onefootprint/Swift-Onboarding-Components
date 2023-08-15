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
  resetUser,
} from 'src/config/tests';

import Developers from './developers';
import { withApiKeys, withOnboardingConfigs } from './developers.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Developers />', () => {
  beforeEach(() => {
    withApiKeys();
    withOnboardingConfigs();
    useRouterSpy({
      pathname: '/developers',
      query: {
        tab: 'api_keys',
      },
    });
  });

  afterAll(() => {
    resetUser();
  });

  const renderDevelopers = () => customRender(<Developers />);

  describe('when is in sandbox mode', () => {
    beforeEach(() => {
      asAdminUserInSandbox();
    });

    it('should show a warning message', () => {
      renderDevelopers();
      const warning = screen.getByText(
        "You're viewing test keys. Disable sandbox mode to view live keys.",
      );
      expect(warning).toBeInTheDocument();
    });

    describe('when its restricted to use only the sandbox mode', () => {
      it('should disable the toggle and show a tooltip explaining', async () => {
        asAdminUserInSandboxAndRestricted();
        renderDevelopers();

        const toggle = screen.getByRole('switch') as HTMLButtonElement;
        expect(toggle.disabled).toBeTruthy();
      });
    });
  });

  describe('when toggling', () => {
    it('should go from the sandbox to the live mode', async () => {
      asAdminUserInSandbox();
      renderDevelopers();

      const toggle = screen.getByRole('switch');
      await userEvent.click(toggle);

      await waitFor(() => {
        const warning = screen.getByText(
          "You're viewing live keys. Enable sandbox mode to view test keys.",
        );
        expect(warning).toBeInTheDocument();
      });
    });
  });

  describe('when is in live mode', () => {
    beforeEach(() => {
      asAdminUserInLive();
    });

    it('should show an info message', () => {
      renderDevelopers();
      const info = screen.getByText(
        "You're viewing live keys. Enable sandbox mode to view test keys.",
      );

      expect(info).toBeInTheDocument();
    });

    describe('when toggling', () => {
      it('should go to live to the sandbox mode', async () => {
        renderDevelopers();
        const toggle = screen.getByRole('switch');
        await userEvent.click(toggle);

        await waitFor(() => {
          const warning = screen.getByText(
            "You're viewing test keys. Disable sandbox mode to view live keys.",
          );
          expect(warning).toBeInTheDocument();
        });
      });
    });
  });
});
